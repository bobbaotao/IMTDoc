<template>
    <div class="divContainer">
        <el-row class="SectionTitle">
            <el-col :span="22" :offset="1">
                我的Opportunity列表
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="22" :offset="1">
                <el-table :data="oppDatas" stripe border style="width: 100%" max-height="600px">
                    <el-table-column width="200" label="文档配置" fixed>
                        <template slot-scope="scope">
                            <el-button size="small" type="primary" v-on:click="handConfigInit(scope.row)">创建文档导出配置</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column prop="OpportunityID" label="Opportunity ID" width="120"  fixed>
                    </el-table-column>
                    <el-table-column prop="SalesStage" label="Sales Stage" width="120">
                    </el-table-column>
                    <el-table-column prop="WinProbability" label="Win Probability (in %)" width="100">
                    </el-table-column>
                    <el-table-column prop="P_CategoryDesc" label="Prod. Category descr." width="100">
                    </el-table-column>
                    <el-table-column prop="Description" label="Description" width="180">
                    </el-table-column>
                    <el-table-column prop="ProspectID" label="Prospect ID" width="180">
                    </el-table-column>
                    <el-table-column prop="Prospect" label="Prospect" width="220">
                    </el-table-column>
                    <el-table-column prop="EmployeeResponsible" label="Employee Responsible" width="120">
                    </el-table-column>
                    <el-table-column prop="SalesVolume" label="Exp. Sales Volume" width="180">
                    </el-table-column>
                    <el-table-column prop="Currency" label="Currency" width="100">
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>

    </div>
</template>

<script>
import Utility from '../utility/index';
import { Loading } from 'element-ui';

export default {
    name: "OpportunityList",
    data () {
        return {
            oppDatas: [],
            selectedOppID: null,
            cmmConfig: null
        }
    },
    created () {
        this.LoadMyOppList();
    },
    methods: {
        ShowLoadingView: function() {
            Loading.service({ fullscreen: true });
        },
        HideLoadingView: function() {
            let curLoadingInstance = Loading.service({ fullscreen: true });
            curLoadingInstance.close();
        },
        LoadMyOppList: function() {
            var requestUrl = Utility.dfServiceUrl + "/LoadMyOpportunityList"
            this.ShowLoadingView();

            this.axios.post(requestUrl).then((response) => {
                this.HideLoadingView();

                if(response.data && response.data.LoadMyOpportunityListResult 
                && response.data.LoadMyOpportunityListResult.Status == "success") {
                    this.oppDatas = response.data.LoadMyOpportunityListResult.Data;
                } else if(response.data && response.data.LoadMyOpportunityListResult) {
                    this.$message.error(response.data.LoadMyOpportunityListResult.Message);
                } else {
                    this.$message.error("load opportunity list failed");
                }
            }).catch((error) => {
                this.HideLoadingView();
                this.$message.error(error.data.Message);
            });
        },
        handConfigInit: function(item) {
            var requestUrl = Utility.dfServiceUrl + "/LoadCMMConfig"; // + item.P_CategoryDesc;
            var requestData = {
                categorySize: item.P_CategoryDesc
            };
            this.ShowLoadingView();

            this.axios.post(requestUrl, requestData).then((rep) => {
                this.HideLoadingView();

                if(rep.data && rep.data.LoadCMMConfigResult && rep.data.LoadCMMConfigResult.Status == "success") {
                    this.$router.push({ name: 'CMMConfig', params: {
                            cmmConfig: rep.data.LoadCMMConfigResult.Data,
                            oppID: item.OpportunityID
                        }});
                } else if(rep.data && rep.data.LoadCMMConfigResult) {
                    this.$message.error(rep.data.LoadCMMConfigResult.Message);
                } else {
                    this.$message.error("Load CMM config failed!");
                }
            }).catch((error) => {
                this.HideLoadingView();
                this.$message.error(error.data.message);
            });
        }
    }
}
</script>

<style scoped>
.SectionTitle {
    font-size: 20px;
    line-height: 32px;
    margin-bottom: 15px;
    background-color: rgba(107, 145, 188);
    color: rgba(254, 254, 254);
}
</style>

