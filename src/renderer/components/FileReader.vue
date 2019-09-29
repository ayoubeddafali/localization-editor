<template>
  <v-file-input
    v-model="files"
    color="deep-purple accent-4"
    label="File input"
    multiple
    placeholder="Select your files"
    prepend-icon="mdi-paperclip"
    outlined   
    :show-size="1000"
    @change="loadFiles"
    v-on:click.close="closed"
  >
    <template v-slot:selection="{ index, text }">
      <v-chip
        
        v-if="index < 2"
        color="deep-purple accent-4"
        dark
        label
        small

      >
        {{ text }}
      </v-chip>
      <span
        v-else-if="index === 2"
        class="overline grey--text text--darken-3 mx-2"
      >
        +{{ files.length - 2 }} File(s)
      </span>
    </template>
  </v-file-input>
</template>

<script>
export default {
  data(){
    return {
      files: [] 
    }
  },
  methods: {
    loadFiles(ev) {
      console.log("Loadding,,,")
      this.files = ev
      this.$emit("load", {  files: this.files });
    }, 
    closed(ev){
      console.log("Closing,,,")
      this.$emit("closing")
    }
  }
};
</script>
