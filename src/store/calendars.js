import { v4 as uuidv4 } from "uuid";
import axios from "axios";

const state = {
  localCalendars: [], // Starts empty, then gets populated with the calendars from the local storage
  apiCalendars: [],
  calendar: null,
};

const mutations = {
  setLocalCalendars(state, calendars) {
    state.localCalendars = calendars;
  },

  setApiCalendars(state, calendars) {
    state.apiCalendars = calendars;
  },

  setCalendar(state, calendar) {
    state.calendar = calendar;
  },

  addLocalCalendar(state, calendar) {
    state.localCalendars.push(calendar);
  },

  removeLocalCalendar(state, calendar) {
    state.localCalendars = state.localCalendars.filter(
      (c) => c.uuid !== calendar.uuid
    );
  },

  updateLocalCalendar(state, calendar) {
    const index = state.localCalendars.findIndex((c) => c.uid === calendar.uid);
    state.localCalendars.splice(index, 1, calendar);
  },

  updateApiCalendar(state, calendar) {
    const index = state.apiCalendars.findIndex((c) => c.uuid === calendar.uuid);
    state.apiCalendars.splice(index, 1, calendar);
  },

  addSection(state, section) {
    state.calendar.sections.push(section);
  },
};

const actions = {
  /**
   * This function is used to add a uuid to the calendars
   * generated by previous versions of Duocmatico, which
   * didn't have a uuid.
   */
  async addUuidToCalendars({ state, dispatch }) {
    const calendars = state.localCalendars.map((calendar) => {
      return calendar.uuid ? calendar : { uuid: uuidv4(), ...calendar };
    });
    dispatch("setLocalCalendars", calendars);
  },

  async getLocalCalendars({ commit }) {
    const calendars = JSON.parse(localStorage.getItem("calendars")) ?? [];
    commit("setLocalCalendars", calendars);
  },

  // This is used over and over again, so it's better to have it as a function
  async saveLocalCalendars({ state }) {
    localStorage.setItem("calendars", JSON.stringify(state.localCalendars));
  },

  async setLocalCalendars({ commit, dispatch }, calendars) {
    commit("setLocalCalendars", calendars);
    dispatch("saveLocalCalendars");
  },

  async addCalendar({ commit, dispatch }, calendar) {
    // adds uuid to calendar
    commit("addCalendar", { uuid: uuidv4(), ...calendar });
    dispatch("saveLocalCalendars");
  },
  async saveSharedCalendar({ commit, dispatch }, sharedCalendar) {
    const newCalendar = { uuid: uuidv4(), ...sharedCalendar };
    commit("addLocalCalendar", newCalendar);
    dispatch("saveLocalCalendars");
  },

  /**
   * Used to get the current user calendars from the API
   */
  async getApiCalendars({ rootState, commit }) {
    try {
      const { token } = rootState.auth;
      const response = await axios.get(`${rootState.apiUrl}/calendars`, {
        headers: {
          Authorization: `Bearer ` + token,
        },
      });

      const calendars = response.data.map((calendar) => {
        return { ...calendar, fromApi: true };
      });

      commit("setApiCalendars", calendars);
      return calendars;
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  /**
   * This function is a general way to delete calendars. It first
   * check if the calendar is inside the local calendars.
   * We always check inside the API because the user could have
   * deleted the calendar from the API.
   */
  async deleteCalendar({ commit, dispatch, rootState }, calendar) {
    // Remove it from local calendars does not affect if it's on API
    commit("removeLocalCalendar", calendar);
    dispatch("saveLocalCalendars");

    try {
      // Delete if from the api
      const { token } = rootState.auth;
      await axios.delete(`${rootState.apiUrl}/calendars/${calendar.uuid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      // If there is an error, the calendar does not exists on API
      // or it's not owned by the user, so we can safely ignore it
    }
  },

  async createCalendar({ dispatch, commit, rootState }, calendar) {
    const { token } = rootState.auth;
    // Create Local Calendar when token is null
    if (!token) {
      commit("addLocalCalendar", { uuid: uuidv4(), ...calendar });
      dispatch("saveLocalCalendars");
      return calendar;
    } else {
      try {
        const response = await axios.post(
          `${rootState.apiUrl}/calendars`,
          calendar,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error(error);
      }
    }
  },

  async updateCalendar({ commit, dispatch, rootState }, calendar) {
    if (!calendar.fromApi) {
      commit("updateLocalCalendar", calendar);
      dispatch("saveLocalCalendars");
    } else {
      // TODO: Clean this up
      try {
        const { token } = rootState.auth;
        const response = await axios.put(
          `${rootState.apiUrl}/calendars/${calendar.uuid}`,
          calendar,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // TODO: send sections to api with an elegant way
        const sectionsId = calendar.sections.map((s) => s.id);
        const sectionsResponse = await axios.post(
          `${rootState.apiUrl}/calendars/${calendar.uuid}/sections`,
          { sections: sectionsId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        return response.data;
      } catch (error) {
        console.error(error);
      }
    }
  },

  /**
   * Change the privacy status of the selected calendar.
   *
   * @param {*} uuid
   * @returns Promise
   */
  async togglePrivacy({ state, commit, rootState }, uuid) {
    const calendar = state.apiCalendars.find((c) => c.uuid === uuid);
    if (!calendar) {
      return Promise.reject("Calendar not found");
    }

    const { token } = rootState.auth;
    const response = await axios.patch(
      rootState.apiUrl + "/calendars/" + uuid,
      { is_public: !calendar["is_public"] },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const apiCalendar = { ...response.data, fromApi: true };
    commit("updateApiCalendar", apiCalendar);
    commit("setCalendar", apiCalendar);

    return Promise.resolve(apiCalendar);
  },

  async getLocalCalendarByUuid({ state, commit }, uuid) {
    const calendar = state.localCalendars.find((c) => c.uuid === uuid);
    commit("setCalendar", calendar);
  },

  /**
   * Fetch a calendar from the API by its uuid
   * If the calendar is not found, it returns null
   */
  async getApiCalendarByUuid({ state, commit, rootState }, uuid) {
    try {
      const { token } = rootState.auth;
      const response = await axios.get(
        `${rootState.apiUrl}/calendars/${uuid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      commit("setCalendar", { ...response.data, fromApi: true });
      return response.data;
    } catch (error) {
      return null;
    }
  },
  async saveSharedCalendarToAPI({ commit, rootState }, calendar) {
    const { token } = rootState.auth;
    if (token) {
      try {
        const response = await axios.post(
          `${rootState.apiUrl}/calendars`,
          calendar,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        commit("setApiCalendars", [...state.apiCalendars, response.data]);
        return response.data;
      } catch (error) {
        console.error("Error al guardar el calendario en la API:", error);
        throw error;
      }
    } else {
      throw new Error("El usuario no está autenticado");
    }
  },
  async saveAndDuplicateSharedCalendar({ dispatch }, uuid) {
    try {
      const originalCalendar = await dispatch("getApiCalendarByUuid", uuid);
      if (!originalCalendar) {
        throw new Error("Calendario no encontrado");
      }
      const newCalendar = await dispatch(
        "saveSharedCalendar",
        originalCalendar
      );
      try {
        await dispatch("createCalendar", newCalendar);
      } catch (error) {
        console.warn("No se pudo guardar en la API, pero se guardó localmente");
      }

      alert("Calendario guardado con éxito");
    } catch (error) {
      alert("Hubo un error al guardar el calendario: " + error.message);
    }
  },
  /**
   * The following set of actions are used only to
   * add or remove sections in the calendar editor.
   * They are not used anywhere else.
   */

  async addSection({ state, dispatch, commit }, section) {
    const calendar = state.calendar;
    commit("addSection", section);
    dispatch("updateCalendar", calendar);
  },

  async removeSection({ state, dispatch }, section) {
    const calendar = state.calendar;
    calendar.sections = calendar.sections.filter(
      (s) => s.code !== section.code
    );
    dispatch("updateCalendar", calendar);
  },
};
const getters = {
  UuidApiCalendarsExist: (state) => (uuid) => {
    return state.apiCalendars.some((calendar) => calendar.uuid === uuid);
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
