<template>
    <div class="divContainer">
        <el-row class="smallRow">
            <el-col :span="4" :offset="1">
                <el-button size="mini" v-on:click="routerReturn">返回上一页</el-button>
            </el-col>
        </el-row>
        <el-row class="SectionTitle">
            <el-col :span="22" :offset="1">
                {{oppID}}的配置列表
            </el-col>
        </el-row>
        <el-row class="smallRow">
            <el-col :span="22" :offset="1">
                <el-table :data="configList" stripe border style="width: 100%" max-height="250px">
                    <el-table-column width="300"  label="操作">
                        <template slot-scope="scope" >
                            <el-button type="primary" v-if="scope.row.Status == 'NotStart'" size="mini" v-on:click="GoToConfigPage(scope.row)">
                                管理配置
                            </el-button>
                            <el-button type="primary" v-if="scope.row.Status != 'NotStart'" size="mini" v-on:click="GoToConfigPage(scope.row)">
                                查看配置
                            </el-button>
                            <el-button type="primary" v-if="scope.row.Status == 'NotStart'"  size="mini" v-on:click="GenerateDoc(scope.row)">
                                生成文档
                            </el-button>
                            <el-button type="primary" v-if="scope.row.Status == 'Finish'"  size="mini" v-on:click="DownloadDoc(scope.row)">
                                下载文档
                            </el-button>
                        </template>
                    </el-table-column>
                    <el-table-column width="120" label="Status">
                        <template slot-scope="scope">
                            {{GetDocStatus(scope.row)}}
                        </template>
                    </el-table-column>
                    <el-table-column width="400" prop="Name" label="Name">

                    </el-table-column>
                    <el-table-column width="200" prop="Modified" label="Modified Time">

                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>
         <el-row class="SectionTitle">
            <el-col :span="22" :offset="1">
                创建新的配置
            </el-col>
        </el-row>
        <el-row>
            <el-col>
                <el-row class="smallRow">
                    <el-col :span="4" :offset="1" class="colTitle">CMM Type</el-col>
                    <el-col :span="10" class="colValue">
                        <el-select :disabled="!allowSelectType" class="middleSelector" v-model="type">
                            <el-option v-for="item in typeOptions" :key="item.ID" 
                                :label="item.Item" :value="item.ID">
                            </el-option>
                        </el-select>
                    </el-col>
                </el-row>
                <el-row class="smallRow">
                    <el-col :span="4" :offset="1" class="colTitle">CMM Size</el-col>
                    <el-col :span="10" class="colValue">
                        <el-select :disabled="!allowSelectSize" class="middleSelector" v-model="size">
                            <el-option v-for="item in sizeOptions" :key="item.ID" 
                                :label="item.Item" :value="item.ID">
                            </el-option>
                        </el-select>
                    </el-col>
                </el-row>
                <el-row class="smallRow">
                    <el-col :span="4" :offset="1" class="colTitle">CMM Sensor</el-col>
                    <el-col :span="10" class="colValue">
                        <el-select :disabled="!allowSelectSensor" class="middleSelector" v-model="sensor">
                            <el-option v-for="item in sensorOptions" :key="item.ID" 
                                :label="item.Item" :value="item.ID">
                            </el-option>
                        </el-select>
                    </el-col>
                </el-row>
                <el-row class="smallRow">
                    <el-col :span="3" :offset="5">
                        <el-button size="tiny" :disabled="!allowInitConfig" 
                            v-on:click="initConfigByID">配置导出文档</el-button>
                    </el-col>
                </el-row>
            </el-col>
        </el-row>
        
    </div>
</template>

<script>
import Utility from '../utility/index';
import { Loading } from 'element-ui';

export default {
    name: "CMMConfig",
    data () {
        return {
            typeOptions: null,
            sizeOptions: null,
            sensorOptions: null,
            type: null,
            size: null,
            sensor: null,
            docID: null,
            allowSelectType: false,
            allowSelectSize: false,
            allowSelectSensor: false,
            oppID: null,
            allowInitConfig: false,

            configList: []
        }
    },
    props: ['cmmConfig'],
    created () {
        this.LoadAllOptions();
        this.initComponentData();
    },
    watch: {
        type: function(newValue) {
            this.handleSelectValueChange();
        },
        size: function(newValue) {
            this.handleSelectValueChange();
        },
        sensor: function(newValue) {
            this.handleSelectValueChange();
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
        GetDocStatus: function(row) {
            switch (row.Status) {
                case "NotStart":
                    return "未提交生成";
                case "Starting":
                    return "生成中...";
                case "Processing":
                    return "生成中...";
                case "Finish":
                    return "已生成";
                case "Failed":
                    return "生成出错";
                default:
                    return "UNKNOW";
            }
        },
        routerReturn: function() {
            this.$router.go(-1);
        },
        LoadAllOptions: function() {
            var requestUrl = Utility.dfServiceUrl + "/LoadAllOptions";
            //this.ShowLoadingView();

            this.axios.post(requestUrl).then((rep) => {
                //this.HideLoadingView();
                if(rep.data && rep.data.LoadAllOptionsResult 
                && rep.data.LoadAllOptionsResult.Status == "success")
                {
                    var repData = rep.data.LoadAllOptionsResult.Data;
                    this.typeOptions = repData.TypeOptions;
                    this.sizeOptions = repData.SizeOptions;
                    this.sensorOptions = repData.SensorOptions;
                } 
                else if(rep.data && rep.data.LoadAllOptionsResult)
                {
                    this.$message.error(rep.data.LoadAllOptionsResult.Message);
                } 
                else 
                {
                    this.$message.error("Load Options failed!");
                }
            }).catch((error) => {
                //this.HideLoadingView();
                this.$message.error(error.data.message);
            });
        },
        LoadDocIDByConfig: function() {
            var requestUrl = Utility.dfServiceUrl + "/LoadBidDocID" + "/" + this.type 
                    + "/" + this.size + "/" + this.sensor;
            this.docID = null;
            this.allowInitConfig = false;
            this.ShowLoadingView();

            this.axios.post(requestUrl).then((rep) => {
                this.HideLoadingView();

                if(rep.data && rep.data.LoadBidDocIDResult && rep.data.LoadBidDocIDResult.Status == "success") {
                    this.docID = rep.data.LoadBidDocIDResult.Data;
                    this.allowInitConfig = true;
                } else if (rep.data && rep.data.LoadBidDocIDResult) {
                    this.$message.error(rep.data.LoadBidDocIDResult.Message);
                } else {
                    this.$message.error("Load Doc failed by ID");
                }
            }).catch((error) => {
                this.HideLoadingView();
                this.$message.error(error.data.message);
            });
        },
        handleSelectValueChange: function() {
            if(this.type && this.size && this.sensor) {
                if(this.type != -1 && this.size != -1 && this.sensor != -1) {
                    this.LoadDocIDByConfig();
                }
            }
        },
        initConfigByID: function() {
            var requestUrl = Utility.dfServiceUrl + "/InitNewConfig/" + this.docID + "/" + this.oppID;
            this.ShowLoadingView();

            this.axios.post(requestUrl).then((rep) => {
                this.HideLoadingView();
                if(rep.data && rep.data.InitNewConfigResult && 
                    rep.data.InitNewConfigResult.Status == "success") {
                        //route to sales doc config
                        this.$router.push({
                            name: 'SalesDocConfig',
                            params: {
                                oppID: this.oppID,
                                docID: rep.data.InitNewConfigResult.Data
                            }
                        });
                } else if(rep.data && rep.data.InitNewConfigResult) {
                    this.$message.error(rep.data.InitNewConfigResult.Message);
                } else {
                    this.$message.error("Init doc failed!");
                }
            }).catch((error) => {
                this.HideLoadingView();
                this.$message.error(error.data.message);
            });
        },
        initComponentData: function() {
            if(this.$route.params && this.$route.params.cmmConfig && this.$route.params.oppID) 
            {
                this.type = this.$route.params.cmmConfig.CMMTypeID;
                this.size = this.$route.params.cmmConfig.CMMSizeID;
                this.sensor = this.$route.params.cmmConfig.CMMSensorID;

                this.allowSelectType = this.$route.params.cmmConfig.IsAllowSelectType;
                this.allowSelectSize = this.$route.params.cmmConfig.IsAllowSelectSize;
                this.allowSelectSensor = this.$route.params.cmmConfig.IsAllowSelectSensor;
                this.oppID = this.$route.params.oppID;
                this.loadAllConfig();
            } else if(this.$route.params && this.$route.params.oppID) {
                this.oppID = this.$route.params.oppID;
                this.loadAllConfig();
                this.loadDefaultConfigByOppID();
            }
            else {
                this.$message.error("oppid is null or cmm config is null!");
            }
        },
        loadDefaultConfigByOppID: function() {
            var requestUrl = Utility.dfServiceUrl + "/LoadCMMConfigByOppID/" + this.oppID;
            //this.ShowLoadingView();

            this.axios.post(requestUrl).then((rep) => {
                //this.HideLoadingView();

                if(rep.data && rep.data.LoadCMMConfigByOppIDResult &&
                    rep.data.LoadCMMConfigByOppIDResult.Status == "success") {
                        var repData = rep.data.LoadCMMConfigByOppIDResult.Data;

                        this.type = repData.CMMTypeID;
                        this.size = repData.CMMSizeID;
                        this.sensor = repData.CMMSensorID;

                        this.allowSelectType = repData.IsAllowSelectType;
                        this.allowSelectSize = repData.IsAllowSelectSize;
                        this.allowSelectSensor = repData.IsAllowSelectSensor;

                    } else if(rep.data && rep.data.LoadCMMConfigByOppIDResult) {
                        this.$message.error(rep.data.LoadCMMConfigByOppIDResult.Message);
                    } else {
                        this.$message.error("Load config failed!");
                    }
            }).catch((error) => {
                //this.HideLoadingView();

                this.$message.error("load config failed!");
            });

        },
        loadAllConfig: function() {
            var requestUrl = Utility.dfServiceUrl + "/LoadConfigListByOppID/" + this.oppID;
            this.ShowLoadingView();

            this.axios.post(requestUrl).then((rep) => {
                this.HideLoadingView();

                if(rep.data && rep.data.LoadConfigListByOppIDResult && 
                   rep.data.LoadConfigListByOppIDResult.Status == "success") {
                        this.configList = rep.data.LoadConfigListByOppIDResult.Data;
                   } else if(rep.data && rep.data.LoadConfigListByOppIDResult) {
                        this.$message.error(rep.data.LoadConfigListByOppIDResult.Message)
                   } else {
                        this.$message.error("load config list failed");
                   }
            }).catch((error) => {
                this.HideLoadingView();
                this.$message.error(error.data.message);
            });
        },
        GoToConfigPage: function(item) {
             this.$router.push({
                            name: 'SalesDocConfig',
                            params: {
                                oppID: this.oppID,
                                docID: item.ID
                            }
                        });
        },
        GenerateDoc: function(item) {
            var requestUrl = Utility.dfServiceUrl + "/GenerateDoc/" + item.ID;
            item.Status = "Starting";
            this.ShowLoadingView();

            this.axios.post(requestUrl).then((rep) => {
                this.HideLoadingView();

                if(rep.data && rep.data.GenerateDocResult &&
                    rep.data.GenerateDocResult.Status == "success") {
                        this.$message("Start Generate File!");
                        //this.ReloadFileStatus(docID);
                        setTimeout(() => { this.ReloadFileStatus(item.ID)},5000);
                    } else if (rep.data && rep.data.GenerateDocResult) {
                        this.$message.error(rep.data.GenerateDocResult.Message);
                    } else {
                        this.$message.error("Generate doc failed!");
                    }
            }).catch((error) => {
                this.HideLoadingView();
                this.$message.error("Generate doc failed!");
            });
        },
        // ReloadFileStatus: function(docID){
        //     setTimeout(() => {
        //         var requestUrl = Utility.dfServiceUrl + "/LoadDocStatus/" + docID;

        //         this.axios.post(requestUrl).then((rep) => {
        //             if(rep.data && rep.data.LoadDocStatusResult &&
        //             rep.data.LoadDocStatusResult.Status == "success") {
        //                 var docStatus = rep.data.LoadDocStatusResult.Data;
        //                 switch(docStatus) {
        //                     case "NotStart":
        //                     this.ReloadFileStatus(docID);
        //                     return;
        //                     case "Starting":
        //                     this.ReloadFileStatus(docID);
        //                     return;
        //                     case "Processing":
        //                     this.ReloadFileStatus(docID);
        //                     return;
        //                     case "Finish":
        //                     this.loadAllConfig();
        //                     return;
        //                     case "Failed":
        //                     this.$message.error("doc generated failed");
        //                     this.loadAllConfig();
        //                     return;
        //                     default:
        //                     this.$message.error("wrong status!");
        //                     return;
        //                 }
        //             } else if(rep.data && rep.data.LoadDocStatusResult) {
        //                 this.$message.error(rep.data.LoadDocStatusResult.Message);
        //             } else {
        //                 this.$message.error("Load doc "+ docID +" status failed!");
        //             }
        //         }).catch((error) => {
        //             this.$message.error("Load doc "+ docID +" status failed!");
        //         });

        //     }, 5000);
        // },
        DownloadDoc: function(item) {
            var url = Utility.fileHandlerUrl + item.ID;
            window.open(url);
        },
        ReloadFileStatus: function(docID) {
            var requestUrl = Utility.dfServiceUrl + "/LoadDocStatus/" + docID;

                this.axios.post(requestUrl).then((rep) => {
                    if(rep.data && rep.data.LoadDocStatusResult &&
                    rep.data.LoadDocStatusResult.Status == "success") {
                        var docStatus = rep.data.LoadDocStatusResult.Data;
                        switch(docStatus) {
                            case "NotStart":
                            setTimeout(() => { this.ReloadFileStatus(docID)},5000);
                            return;
                            case "Starting":
                            setTimeout(() => { this.ReloadFileStatus(docID)},5000);
                            return;
                            case "Processing":
                            setTimeout(() => { this.ReloadFileStatus(docID)},5000);
                            return;
                            case "Finish":
                            this.loadAllConfig();
                            return;
                            case "Failed":
                            this.$message.error("doc generated failed");
                            this.loadAllConfig();
                            return;
                            default:
                            this.$message.error("wrong status!");
                            return;
                        }
                    } else if(rep.data && rep.data.LoadDocStatusResult) {
                        this.$message.error(rep.data.LoadDocStatusResult.Message);
                    } else {
                        this.$message.error("Load doc "+ docID +" status failed!");
                    }
                }).catch((error) => {
                    this.$message.error("Load doc "+ docID +" status failed!");
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
