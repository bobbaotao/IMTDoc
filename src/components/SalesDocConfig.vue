<template>
    <div class="divContainer">
        <el-row class="smallRow">
            <el-col :span="6" :offset="2">
                <el-button type="primary" v-if="IsAllowEdit" size="mini" v-on:click="IsEdit = true">Edit
                </el-button>
                <el-button type="primary" v-if="IsAllowEdit" size="mini" v-on:click="SaveSelectedToServer">
                    Save
                </el-button>
                <el-button size="mini" v-on:click="routerReturn">返回上一页</el-button>
            </el-col>
        </el-row>
        <el-row class="SectionTitle">
            <el-col :span="22" :offset="1">
                文档配置
            </el-col>
        </el-row>
        <el-row class="smallRow">
            <el-col :span="20" :offset="2">
                <el-tree :disabled="!IsEdit" ref="tree"
                    :data="docConfig"
                    show-checkbox
                    node-key="id"
                    :default-checked-keys="selectedIDs"
                    :props="defaultProps">
                </el-tree>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import Utility from '../utility/index';
import { Loading } from 'element-ui';

export default {
    name: "SalesDocConfig",
    data () {
        return {
            IsEdit: false,
            docConfig: [],
            selectedIDs: [],
            salesDocID: null,
            oppID: null,
            IsAllowEdit : false,
            defaultProps: {
                children: 'children',
                label: 'label'
                }
        }
    },
    watch: {
          '$route' (to, from) {
              if(this.$route.params && this.$route.params.oppID && this.$route.params.docID) {
                    this.oppID = this.$route.params.oppID;
                    this.salesDocID = this.$route.params.docID;
                    this.LoadConfigFromServer();
                } else {
                    this.$message.error("oppid is null or doc id is null!");
                }
          }
    },
    created () {
        if(this.$route.params && this.$route.params.oppID && this.$route.params.docID) {
            this.oppID = this.$route.params.oppID;
            this.salesDocID = this.$route.params.docID;
            this.LoadConfigFromServer();
        } else {
            this.$message.error("oppid is null or doc id is null!");
        }
    },
    methods: {
        ShowLoadingView: function() {
            Loading.service({ fullscreen: true });
        },
        HideLoadingView: function() {
            let curLoadingInstance = Loading.service({ fullscreen: true });
            curLoadingInstance.close();
        },
        routerReturn: function() {
            this.$router.go(-1);
        },
        LoadConfigFromServer: function() {
            var requestUrl = Utility.dfServiceUrl + "/GetSalesDocConfig";
            var requestData = {
                oppID: this.oppID,
                docID: this.salesDocID
            };
            this.ShowLoadingView();

            this.axios.post(requestUrl, requestData).then((rep) => {
                this.HideLoadingView();

                if(rep.data && rep.data.GetSalesDocConfigResult &&
                   rep.data.GetSalesDocConfigResult.Status == "success") {
                       this.docConfig = rep.data.GetSalesDocConfigResult.Data.DocNodeTrees;
                       this.selectedIDs = rep.data.GetSalesDocConfigResult.Data.SelectedNodes;
                       this.IsAllowEdit = rep.data.GetSalesDocConfigResult.Data.IsAllowEdit;
                   } else if(rep.data && rep.data.GetSalesDocConfigResult) {
                       this.$message.error(rep.data.GetSalesDocConfigResult.Message);
                   } else {
                       this.$message.error("load config failed")
                   }
            }).catch((error) => {
                this.HideLoadingView();
                this.$message.error(error.data.message);
            });
        },
        LoadTreeSelectedKey: function() {
            var result = this.$refs["tree"].getCheckedKeys();
            return result;
        },
        SaveSelectedToServer: function() {
            var requestURL = Utility.dfServiceUrl + "/SaveSalesDocConfig";
            var requestData = {
                oppID: this.oppID,
                docID: this.salesDocID,
                selectedNodeIDs: this.LoadTreeSelectedKey()
            };
            this.ShowLoadingView();
            //console.dir(requestData);

            this.axios.post(requestURL, requestData).then((rep) => {
                this.HideLoadingView();

                if(rep.data && rep.data.SaveSalesDocConfigResult &&
                   rep.data.SaveSalesDocConfigResult.Status == "success") {
                       this.IsEdit = false;
                       this.$message("Save success!");
                   } else if (rep.data && rep.data.SaveSalesDocConfigResult) {
                       this.$message.error(rep.data.SaveSalesDocConfigResult.Message);
                   } else {
                       this.$message.error("Save failed!");
                   }
            }).catch((error) => {
                this.HideLoadingView();

                this.$message.error("Save failed!")
            });
        }
    }
}
</script>

<style scoped>
.divContainer {
    text-align: left;
    font-size: 14px;
    line-height: 20px;
}
.colTitle {
    padding-left: 10px;
}
.colValue {
    padding-left: 10px;
}
.smallRow {
    padding: 3px 0px 3px 0px;
}
.middleSelector {
    width: 250px;
}
.SectionTitle {
    font-size: 20px;
    line-height: 32px;
    margin-bottom: 15px;
    background-color: rgba(107, 145, 188);
    color: rgba(254, 254, 254);
}
</style>

