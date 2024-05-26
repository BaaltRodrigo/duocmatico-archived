<template>
  <nuxt-layout :name="'home'">
    <v-alert
      color="primary"
      variant="flat"
      icon="mdi-information"
      class="rounded-0"
      closable
    >
      Aun estamos moviendo algunas cosas. Por lo que es posible que encuentres
      errores.
    </v-alert>
    <v-container class="my-16" style="max-width: 80rem">
      <home-hero />
    </v-container>
    <!-- Card with features -->
    <v-container
      class="rounded-xl bg-grey-lighten-5 pa-10 mb-10"
      style="max-width: 80rem"
    >
      <h2 class="text-h5 mb-8">Cosas que puedes hacer con Duocmatico</h2>
      <v-row>
        <v-col
          cols="12"
          md="4"
          v-for="(feature, index) in features"
          :key="feature.title"
        >
          <home-feature-card :feature="feature" />
        </v-col>
      </v-row>
      <!-- <v-divider class="my-10 mx-10"></v-divider> -->
    </v-container>
  </nuxt-layout>
</template>

<script lang="ts" setup>
const features = ref([
  {
    title: "Planifica mas facil",
    image: "/images/undraw/undraw_scrum_board.svg",
    items: [
      { title: "Crea varios calendarios", icon: "mdi-calendar-multiple" },
      { title: "Ve topes de horarios", icon: "mdi-calendar-check" },
      { title: "Busca facil tus asignaturas", icon: "mdi-note-search" },
    ],
  },
  {
    title: "Comparte tus horarios",
    image: "/images/undraw/undraw_engineering_team.svg",
    items: [
      { title: "Comparte con un click", icon: "mdi-link" },
      { title: "Guarda horarios que te compartan", icon: "mdi-calendar-plus" },
      { title: "Habilitamos QR!", icon: "mdi-qrcode" },
    ],
  },
  {
    title: "Multiple dispositivos",
    image: "/images/undraw/undraw_in_sync.svg",
    items: [
      { title: "Usa tu cuenta de google", icon: "mdi-google" },
      { title: "Ten tus horairos en la nube", icon: "mdi-cloud" },
      {
        title: "Entra desde cualquier dispositivo",
        icon: "mdi-cellphone-link",
      },
    ],
  },
]);
</script>
