<template>
  <div>
    <br />
    <div class="inputs">
      <text-reader id="fileSelector" @load="onLoadFiles" @closing="onClose"></text-reader>
      <v-text-field
        v-if="searchField && filesAreLoaded"
        v-model="keyword"
        label="Search"
        clearable
        outlined
      ></v-text-field>

      <v-btn class="mx-2" v-if="!searchField" fab @click="searchField = true " color="cyan">
        <v-icon dark>mdi-file-find</v-icon>
      </v-btn>
      <v-btn class="mx-2" v-if="searchField" @click="filterByKeyword" fab color="cyan">
        <v-icon dark>mdi-send</v-icon>
      </v-btn>
    </div>

    <!-- actions  -->
    <div id="actions">
      <div style="margin-bottom: 30px" class="switch" v-if="filesAreLoaded">
        <p>Edit Mode :</p>
        <RockerSwitch
          :disabled="gridData.length == 0"
          size="medium"
          @change="editModeEnabled = !editModeEnabled"
          :value="switchDefault"
        ></RockerSwitch>
      </div>
      <div class="buttons">
        <v-btn
          v-if="!repoIsConfigured"
          class="ma-2"
          color="#FFD740"
          @click="loadRepoConfigurationForm()"
        >Configure Repository</v-btn>
        <v-btn
          class="ma-2"
          :disabled="!filesAreLoaded || reloaded"
          color="#42A5F5"
          @click="loadFiles()"
        >Load File(s)</v-btn>

        <v-btn
          :disabled="!dataChanged"
          color="#E65100"
          class="ma-2 white--text"
          @click="saveChanges()"
        >Save Changes</v-btn>
        <v-btn
          class="ma-2"
          :disabled="!dataChanged"
          color="#00695C"
          @click="pushChanges()"
        >Push Changes</v-btn>
        <v-btn @click="addPropertyModal = true" class="ma-2" outlined small fab color="blue">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <v-btn
          v-if="repoIsConfigured"
          @click="loadRepoConfigurationForm()"
          class="ma-2"
          outlined
          small
          fab
          color="#000"
        >
          <v-icon>mdi-wrench</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Repository Configuration Form -->

    <v-row justify="center">
      <v-dialog v-model="repo_dialog" persistent max-width="600px">
        <v-card>
          <v-card-title>
            <span class="headline">Repository Infos</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-form ref="form" v-model="valid" lazy-validation>
                <v-row>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      v-model="username"
                      :rules="usernameRules"
                      label="Username*"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field v-model="email" :rules="emailRules" label="E-mail*" required></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      v-model="password"
                      type="password"
                      :rules="passwordRules"
                      label="Password*"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field v-model="branch" label="Branch*"></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="repo_url"
                      :rules="repoRules"
                      label="Repository Url*"
                      required
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-form>
            </v-container>
            <small>*indicates required field</small>
          </v-card-text>
          <v-card-actions>
            <div class="flex-grow-1"></div>
            <v-btn color="blue darken-1" text @click="repo_dialog = false">Close</v-btn>
            <v-btn color="blue darken-1" text @click="configureRepo()">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>

    <!-- Add property Modal -->

  <v-row justify="center">
      <v-dialog v-model="addPropertyModal" persistent max-width="600px">
        <v-card>
          <v-card-title>
            <span class="headline">Property Details</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-form ref="form" v-model="valid" lazy-validation>
                <v-row>
                  <v-col v-for="column of columns" cols="12" sm="12" md="12">
                    <v-text-field
                      v-model="newProperty[`${column}`]"
                      :label="column"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-form>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <div class="flex-grow-1"></div>
            <v-btn color="blue darken-1" text @click="addPropertyModal = false">Close</v-btn>
            <v-btn color="blue darken-1" text @click="addNewProperty()">Add</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>

    <!--  -->

    <!-- Save Dialo -->
    <div class="text-center">
      <v-dialog v-model="save_dialog" hide-overlay persistent width="300">
        <v-card color="#42A5F5" dark>
          <v-card-text>
            Saving Changes
            <v-progress-linear indeterminate color="#EEEEEE" class="mb-0"></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-dialog>
    </div>
    <!-- Push Dialog -->
    <div class="text-center">
      <v-dialog v-model="push_dialog" hide-overlay persistent width="300">
        <v-card color="#00796B" dark>
          <v-card-text>
            Pushing Changes
            <v-progress-linear indeterminate color="#EEEEEE" class="mb-0"></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-dialog>
    </div>
    <!-- Error Dialog -->
    <div class="text-center">
      <v-dialog v-model="error_dialog" hide-overlay persistent width="300">
        <v-card color="#B71C1C" dark>
          <v-card-text>Operation Failed !!</v-card-text>
        </v-card>
      </v-dialog>
    </div>

    <!-- success dialog  -->
    <div class="text-center">
      <v-dialog v-model="success_dialog" hide-overlay persistent width="300">
        <v-card color="#4A148C" dark>
          <v-card-text>Operation Succeded !!</v-card-text>
        </v-card>
      </v-dialog>
    </div>
    <!-- Table Data & Pagination -->
    <div v-if="gridData.length != 0">
      <div class="card-body">
        <el-table :data="pageOfItems" style="width: 100%">
          <el-table-column v-for="column in columns" :label="column" min-width="180">
            <editable-cell
              @input="dataChanged = true"
              slot-scope="{row}"
              v-model="row[column]"
              :can-edit="editModeEnabled"
            >
              <span slot="content">{{row[column]}}</span>
            </editable-cell>
          </el-table-column>
        </el-table>
      </div>
      <div class="card-footer pb-0 pt-3">
        <jw-pagination :items="gridData" @changePage="onChangePage" :pageSize="20" :maxPages="20"></jw-pagination>
      </div>
    </div>
  </div>
</template> 


<script>
// Import packages
import EditableCell from "./EditableCell";
import FileReader from "./FileReader";
import RockerSwitch from "vue-rocker-switch";
import PropertiesReader from "./../utils/PropertiesReader";
import * as git from "isomorphic-git";

// Init consts
const fs = require("fs");
const os = require("os");
const storage = require("electron-json-storage");

// Import styles
import "vue-rocker-switch/dist/vue-rocker-switch.css";
import "vuetify/dist/vuetify.min.css";

git.plugins.set("fs", fs);

var properties = {
  all: null
};

export default {
  name: "App",
  components: {
    RockerSwitch,
    EditableCell,
    "text-reader": FileReader
  },
  data() {
    return {
      marker: true,
      addPropertyModal: false, 
      newProperty: {}, 
      keyword: "",
      searchField: false,
      switchDefault: false,
      base_folder: "",
      columns: ["property"],
      text: "",
      files: [],
      reloaded: false,
      // filesAreLoaded: false,
      pageOfItems: [],
      editModeEnabled: false,
      gridData: [],
      backupData: [],
      dataChanged: false,
      dataSaved: false,
      save_dialog: false,
      push_dialog: false,
      error_dialog: false,
      success_dialog: false,
      repo_dialog: false,
      repoIsConfigured: false,
      username: "",
      password: "",
      email: "",
      repo_url: "",
      branch: "develop",
      valid: true,
      emailRules: [
        v => !!v || "E-mail is required",
        v => /.+@.+\..+/.test(v) || "E-mail must be valid"
      ],
      usernameRules: [v => !!v || "Username is required"],
      passwordRules: [v => !!v || "Passwrod is required"],
      repoRules: [v => !!v || "Repository URL is required"]
    };
  },
  watch: {
    save_dialog(val) {
      if (!val) return;
    },
    push_dialog(val) {
      if (!val) return;
    },
    error_dialog(val) {
      if (!val) return setTimeout(() => (this.error_dialog = false), 1500);
    },
    success_dialog(val) {
      if (!val) return;
    }
  },
  created() {
    this.repoConfigExists();
  },
  computed: {
    filesAreLoaded() {
      return this.files.length != 0;
    }
  },
  methods: {
    filterByKeyword() {
      if (this.keyword != "")
        this.pageOfItems = this.gridData.filter(this.byKeyword);
      else this.pageOfItems = this.gridData;
      // this.pageOfItems = this.gridData;
    },
    byKeyword(item, index, self) {
      for (var value of Object.values(item)) {
        if (value.indexOf(this.keyword) != -1) {
          return true;
        }
      }
      return false;
    },
    repoConfigExists() {
      var self = this;
      storage.has("repository", function(error, hasKey) {
        if (error) throw error;

        if (hasKey) {
          console.log("There is data stored as `repository`");
          self.repoIsConfigured = true;
          storage.get("repository", function(error, data) {
            if (error) throw error;
            else {
              self.username = data.username;
              self.email = data.email;
              self.repo_url = data.repo_url;
              self.password = data.password;
              self.branch = data.branch;
            }
          });
          return true;
        } else {
          self.repoIsConfigured = false;
          console.log("No data stored as `repository`");
        }
      });
      return false;
    },
    onLoadFiles(ev) {
      this.initializeData();
      this.files = ev.files;
      console.log(this.files);
      // this.filesAreLoaded = true
    },
    onClose(ev) {
      this.switchDefault = false;
      this.editModeEnabled = false;
      this.reloaded = false;
    },
    onChangePage(pageOfItems) {
      // update page of items
      this.pageOfItems = pageOfItems;
    },
    initializeData() {
      this.gridData = [];
      this.pageOfItems = [];
      this.columns = ["property"];
      this.editModeEnabled = false;
      this.dataChanged = false;
      this.dataSaved = false;
    },
    getFileContent(file) {
      return new Promise((resolve, reject) => {
        var reader = new FileReader();
        reader.onload = function(event) {
          var content = event.target.result;
          resolve(content);
        };
        reader.onerror = function(event) {
          reject(event);
        };
        reader.readAsText(file);
      });
    },
    onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    },
    loadFiles() {
      // this.filesAreLoaded = false
      this.base_folder = this.files[0].path
        .slice(0, -this.files[0].name.length)
        .toString();

      console.log(`Base Folder is : ${this.base_folder}`);

      // Git Pull

      // git.pull({
      //   dir: this.base_folder,
      //   ref: this.branch,
      //   username: this.username,
      //   password: this.password,
      // }).then(() => console.log("Pull done"))

      for (var file of this.files) {
        var column_name = file.name.slice(0, -11).toString();
        this.columns.push(column_name);
        properties[column_name] = PropertiesReader(file.path);
      }
      // console.log(properties["base_nl"].get("account.confirmation.address.added"))
      var all_keys = [];
      var items_data = [];
      // item = {
      //   "user.name": {
      //     property: "user.name",
      //     base_fr: "French",
      //     base_nl: "Netherland"
      //   }
      // };

      for (var column of this.columns) {
        if (column == "property") continue;

        all_keys[`${column}`] = all_keys.concat(
          Object.keys(properties[`${column}`]["_properties"])
        );
        // all_keys = all_keys + properties[`${column}`]['_properties']
      }
      var keys = all_keys.filter(this.onlyUnique);

      for (var column of this.columns) {
        if (column == "property") continue;
        for (var property of all_keys[`${column}`]) {
          if (items_data[`${property}`]) {
            items_data[`${property}`]["property"] = property;
            items_data[`${property}`][`${column}`] = properties[
              `${column}`
            ].get(property);
          } else {
            items_data[`${property}`] = new Object();
            items_data[`${property}`]["property"] = property;
            items_data[`${property}`][`${column}`] = properties[
              `${column}`
            ].get(property);

            // console.log(items_data);
          }
        }
      }

      for (var item in items_data) {
        this.gridData.push(items_data[item]);
      }
      // console.log(this.gridData);
      // this.backupData = this.gridData
      // for (var property of keys) {
      //   var p = new Object();
      //   for (var column of this.columns) {
      //     if (column == "property") p["property"] = property;
      //     else p[`${column}`] = properties[`${column}`].get(property);
      //   }
      //   this.gridData.push(p);
      // }
      this.pageOfItems = this.gridData;
      this.reloaded = true;
    },
    saveChanges() {
      this.save_dialog = true;
      console.log("Saving updated properties");

      for (var column of this.columns) {
        if (column == "property") continue;
        else {
          for (var prop of this.gridData) {
            if (prop[`${column}`] != undefined && prop[`${column}`] != null)
              properties[`${column}`].set(prop.property, prop[`${column}`]);
          }
          console.log(`Saving to ${this.base_folder}/${column}.properties`);
          properties[`${column}`]
            .save(`${this.base_folder}/${column}.properties`)
            .then(
              () => {
                setTimeout(() => {
                  console.log("File successfully saved");
                  this.save_dialog = false;
                }, 1500);
              },
              () => {
                setTimeout(() => {
                  console.log("Error while saving changes");
                  this.save_dialog = false;
                  this.error_dialog = true;
                }, 1500);
              }
            );
        }
      }
      this.dataSaved = true;
      console.log(this.username);
    },
    pushChanges() {
      if (this.dataChanged && this.dataSaved) {
        console.log("Pushing changes to repo");
        this.push_dialog = true;
        git
          .statusMatrix({ dir: this.base_folder, pattern: "*.properties" })
          .then(changedFiles => {
            for (var changedFile of changedFiles) {
              // console.log(changedFile[0]);
              git
                .add({ dir: this.base_folder, filepath: `${changedFile[0]}` })
                .then(() => {
                  console.log(`${changedFile[0]} was added!!`);
                });
            }
            git
              .commit({
                dir: this.base_folder,
                author: {
                  name: this.username,
                  email: this.email
                },
                message: "Updates"
              })
              .then(sha => {
                console.log(`Commit added with SHA : ${sha}`);
                git
                  .push({
                    dir: this.base_folder,
                    remote: "origin",
                    url: this.repo_url,
                    ref: this.branch,
                    username: this.username,
                    password: this.password,
                    force: true
                  })
                  .then(response => {
                    if (!response.errors) {
                      this.push_dialog = false;
                    } else {
                      console.log(response.errors);
                    }
                  });
              });
          });
      } else {
        this.saveAndPush();
      }
    },
    saveAndPush() {
      this.saveChanges();
      this.pushChanges();
    },
    loadRepoConfigurationForm() {
      this.repo_dialog = true;
    },
    configureRepo() {
      if (this.$refs.form.validate()) {
        this.repo_dialog = false;
        this.repoIsConfigured = true;
        storage.set(
          "repository",
          {
            username: this.username,
            password: this.password,
            email: this.email,
            repo_url: this.repo_url,
            branch: this.branch
          },
          function(error) {
            if (error) throw error;
          }
        );
      }
    }, 
    addNewProperty(){
      this.gridData.push(this.newProperty)
      this.addPropertyModal = false 
      this.dataChanged = true 
    }
  }
};
</script>

<style>
.switch {
  display: flex;
}
#actions {
  display: flex;
  flex-direction: row;
}
.switch {
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.inputs {
  display: flex;
}
#fileSelector {
  flex-grow: 3;
  margin-right: 15px;
}

.switch > p {
  flex-basis: 100px;
}
.edit-cell {
  min-height: 35px;
  cursor: pointer;
}

a {
  cursor: pointer;
}

.pagination {
  justify-content: center;
  flex-wrap: wrap;
}
</style>
