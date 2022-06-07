import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { DefaultTheme, IconButton, Surface, withTheme } from 'react-native-paper';
import DataEdit from './components/DataEdit';
import ExecutionEdit from './components/ExecutionEdit';
import NodeList from './components/NodeList';
import WorkflowList from './components/WorkflowList';

const NODE_PROTOCOL = "http:", NODE_HOST = "localhost", NODE_PORT = "5000"
const REGISTRY_PROTOCOL = "http:", REGISTRY_HOST = "localhost", REGISTRY_PORT = "5001"

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            workflows: [
                {
                    id: 1,
                    title: "Light-based LED Switching",
                },
                {
                    id: 2,
                    title: "Presence-based LED Switching",
                }
            ],
            nodes: [
                {
                    id: 1,
                    title: "Raspberry Pi",
                    services: [
                        {
                            id: 1,
                            title: "Turn Relay on"
                        },
                        {
                            id: 2,
                            title: "Turn Realy off"
                        },
                        {
                            id: 3,
                            title: "Read LDR"
                        },
                        {
                            id: 4,
                            title: "Read HES"
                        },
                    ]
                },
                {
                    id: 0,
                    title: "This Node",
                    services: [
                        {
                            id: 1,
                            title: "Decide Light",
                            workflowId: 1
                        },
                    ]
                },
            ],
            theme: DefaultTheme,
            dataTypes: [],
            uniformServices: [],
            data: [],
            executions: [],
            show: HOME,
            timer: null
        }
        this.setState.bind(this);
    }


    componentDidMount() {
        // let timer = setInterval(() => {
        //     this.refresh()
        // }, 30000);
        // this.setState({ timer });
        this.refresh()
    }

    refresh(){
        (async () => {
            let workflows = await (await fetch(NODE_PROTOCOL + "//" + NODE_HOST + ":" + NODE_PORT + "/workflow")).json()
            console.dir(workflows)
            this.setState({ workflows })
        })();
        (async () => {
            let nodes = await (await fetch(NODE_PROTOCOL + "//" + NODE_HOST + ":" + NODE_PORT + "/node")).json()
            console.dir(nodes)
            this.setState({ nodes })
        })();
        (async () => {
            let dataTypes = await (await fetch(REGISTRY_PROTOCOL + "//" + REGISTRY_HOST + ":" + REGISTRY_PORT + "/datatype")).json()
            console.dir(dataTypes)
            this.setState({ dataTypes })
        })();
        (async () => {
            let uniformServices = await (await fetch(REGISTRY_PROTOCOL + "//" + REGISTRY_HOST + ":" + REGISTRY_PORT + "/uniformservice")).json()
            console.dir(uniformServices)
            this.setState({ uniformServices })
        })();
        (async () => {
            let data = await (await fetch(NODE_PROTOCOL + "//" + NODE_HOST + ":" + NODE_PORT + "/data")).json()
            console.dir(data)
            this.setState({ data })
        })();
        (async () => {
            let executions = await (await fetch(NODE_PROTOCOL + "//" + NODE_HOST + ":" + NODE_PORT + "/service/execution")).json()
            console.dir(executions)
            this.setState({ executions })
        })();
    }

    componentWillUnmount() {
        // if (this.state.timer) clearInterval(this.state.timer)
    }

    addNode(ipAddress, title) {
        (async () => {
            let nodes = this.state.nodes;
            let node = await (await fetch(NODE_PROTOCOL + "//" + NODE_HOST + ":" + NODE_PORT + "/node/0", { method: "POST", body: JSON.stringify({ title, ipAddress }) })).json()
            nodes.push(node)
            this.setState({ nodes })
        })()
    }


    editNode(nodeId, title) {
        (async () => {
            let nodes = this.state.nodes;
            let res = await (await fetch(NODE_PROTOCOL + "//" + NODE_HOST + ":" + NODE_PORT + "/node/" + nodeId, { method: "PATCH", body: JSON.stringify({ title }) })).json()
            nodes = nodes.map(node => { if (node.id == nodeId) node.title = res.title; return node; });
            this.setState({ nodes })
        })()
    }

    removeNode(nodeId) {
        (async () => {
            let res = await (await fetch(NODE_PROTOCOL + "//" + NODE_HOST + ":" + NODE_PORT + "/node/" + nodeId, { method: "DELETE" })).json()
            let nodes = this.state.nodes.filter(node => node.id != res.id)
            this.setState({ nodes })
        })()
    }

    addWorkflow(title, inputDataTypeId, outputDataTypeId) {
        (async () => {
            let workflows = this.state.workflows;
            let workflow = await (await fetch(NODE_PROTOCOL + "//" + NODE_HOST + ":" + NODE_PORT + "/workflow/0", { method: "POST", body: JSON.stringify({ title, inputDataTypeId, outputDataTypeId }) })).json()
            workflows.push(workflow)
            this.setState({ workflows })
        })()
    }


    editWorkflow(workflowId, title, inputDataTypeId, outputDataTypeId) {
        (async () => {
            let workflows = this.state.workflows;
            let res = await (await fetch(NODE_PROTOCOL + "//" + NODE_HOST + ":" + NODE_PORT + "/workflow/" + workflowId, { method: "PATCH", body: JSON.stringify({ title, inputDataTypeId, outputDataTypeId }) })).json()
            workflows = workflows.map(workflow => { if (workflow.id == workflowId) return res; return workflow; });
            this.setState({ workflows })
        })()
    }

    removeWorkflow(workflowId) {
        (async () => {
            let res = await (await fetch(NODE_PROTOCOL + "//" + NODE_HOST + ":" + NODE_PORT + "/workflow/" + workflowId, { method: "DELETE" })).json()
            let workflows = this.state.workflows.filter(workflow => workflow.id != res.id)
            this.setState({ workflows })
        })()
    }

    makeService(workflow, title, uniformServiceId) {
        (async () => {
            if (uniformServiceId === 0) {
                let res = await (await fetch(REGISTRY_PROTOCOL + "//" + REGISTRY_HOST + ":" + REGISTRY_PORT + "/uniformservice/0", { method: "POST", body: JSON.stringify({ title, inputDataTypeId: workflow.inputDataTypeId, outputDataTypeId: workflow.outputDataTypeId }) })).json()
                uniformServiceId = res.id;
                let uniformServices = await (await fetch(REGISTRY_PROTOCOL + "//" + REGISTRY_HOST + ":" + REGISTRY_PORT + "/uniformservice")).json()
                console.dir(uniformServices)
                this.setState({ uniformServices })
            }
            let nodes = this.state.nodes;
            let res = await (await fetch(NODE_PROTOCOL + "//" + NODE_HOST + ":" + NODE_PORT + "/workflow/" + workflow.id + "/service", { method: "POST", body: JSON.stringify({ title, uniformServiceId }) })).json()
            nodes = nodes.map(node => {
                if (node.id == 0) node.services.push(res);
                return node;
            });
            this.setState({ nodes })
        })()
    }

    removeService(workflowId) {
        (async () => {
            let nodes = this.state.nodes;
            let res = await (await fetch(NODE_PROTOCOL + "//" + NODE_HOST + ":" + NODE_PORT + "/workflow/" + workflowId + "/service", { method: "DELETE" })).json()
            nodes = nodes.map(node => {
                if (node.id == 0) node.services = node.services.filter(service => service.workflowId != res.workflowId);
                return node;
            });
            this.setState({ nodes })
        })()

    }

    startService(nodeId, serviceId) {
        //TODO
    }

    startWorkflow(workflowId) {
        (async () => {
            let workflow = await (await fetch(NODE_PROTOCOL + "//" + NODE_HOST + ":" + NODE_PORT + "/workflow/" + workflowId + "/execute", { method: "POST", body: JSON.stringify({ dataId: 0 }) })).json()
        })()
    }

    editorWorkflow(workflow) {
        window.location.assign('/editor#' + workflow.id);
    }

    postData(_data, callback) {
        (async () => {
            let data = this.state.data;
            let res = await (await fetch(NODE_PROTOCOL + "//" + NODE_HOST + ":" + NODE_PORT + "/data/" + _data.id, { method: "POST", body: JSON.stringify(_data) })).json()
            data.splice(0, 0, res)
            this.setState({ data })
            callback(res)
        })()
    }

    deleteData(dataId) {
        (async () => {
            let res = await (await fetch(NODE_PROTOCOL + "//" + NODE_HOST + ":" + NODE_PORT + "/data/" + dataId, { method: "DELETE" })).json()
            let data = this.state.data.filter(data => data.id != res.id)
            this.setState({ data })
        })()
    }

    render() {
        return <Surface style={styles.mainSurface}>
            <Surface style={styles.leftBar}>
                <IconButton icon="home" color={this.state.show == HOME ? "red" : null} onPress={() => this.setState({ show: HOME })} />
                <IconButton icon="database" color={this.state.show == DATA ? "red" : null} onPress={() => this.setState({ show: DATA })} />
                <IconButton icon="script-text-play" color={this.state.show == EXECUTIONS ? "red" : null} onPress={() => this.setState({ show: EXECUTIONS })} />
                <IconButton icon="refresh" onPress={()=>this.refresh()} />
            </Surface>
            {
                this.state.show == HOME
                    ?
                    <ScrollView contentContainerStyle={styles.homelists}>
                        <WorkflowList thisNode={this.state.nodes.reduce((prev, node) => node.id == 0 ? node : prev)} uniformServices={this.state.uniformServices} dataTypes={this.state.dataTypes} workflows={this.state.workflows} onAddWorkflow={(title, inputDataTypeId, outputDataTypeId) => this.addWorkflow(title, inputDataTypeId, outputDataTypeId)} onEditWorkflow={(id, title, inputDataTypeId, outputDataTypeId) => this.editWorkflow(id, title, inputDataTypeId, outputDataTypeId)} onMakeService={(workflow, title, uniformServiceId) => this.makeService(workflow, title, uniformServiceId)} onRemoveService={(id) => this.removeService(id)} onStartWorkflow={(id) => this.startWorkflow(id)} onEditorWorkflow={(workflow) => this.editorWorkflow(workflow)} onRemoveWorkflow={(id) => this.removeWorkflow(id)} />
                        <MaterialCommunityIcons color={this.state.theme.colors.primary} size={18} name='all-inclusive' />
                        <NodeList nodes={this.state.nodes} onAddNode={(ip, title) => this.addNode(ip, title)} onEditNode={(id, title) => this.editNode(id, title)} onStartService={(nodeId, serviceId) => this.startService(nodeId, serviceId)} onRemoveNode={(nodeId) => this.removeNode(nodeId)} />
                        <MaterialCommunityIcons color={this.state.theme.colors.primary} size={18} name='all-inclusive' />
                        <StatusBar style="auto" />
                    </ScrollView>
                    :
                    this.state.show == DATA
                        ?
                        <DataEdit postData={(data, callback) => this.postData(data, callback)} deleteData={(dataId) => this.deleteData(dataId)} contentContainerStyle={styles.homelists} data={this.state.data} dataTypes={this.state.dataTypes} />
                        :
                        this.state.show == EXECUTIONS
                            ?
                            <ExecutionEdit postData={(data, callback) => this.postData(data, callback)} deleteData={(dataId) => this.deleteData(dataId)} contentContainerStyle={styles.homelists} executions={this.state.executions} data={this.state.data} dataTypes={this.state.dataTypes} />
                            :
                            null
            }
        </Surface>;
    }
}

const HOME = 0, DATA = 1, EXECUTIONS = 2;

const styles = StyleSheet.create({
    homelists: {
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1
    },
    mainSurface: {
        flex: 1,
        flexDirection: 'row'
    }
});

export default withTheme(Home);