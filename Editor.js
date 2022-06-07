import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Divider, IconButton, Surface, Text, withTheme } from 'react-native-paper';
import DataTypeEdit from './components/DataTypeEdit';
import TaskEdit from './components/TaskEdit';
import WorkflowEdit from './components/WorkflowEdit';

const DATATYPE_INT = 0, DATATYPE_FLOAT = 1, DATATYPE_TEXT = 2, DATATYPE_VECTOR = 3, DATATYPE_MAP = 4;
const TASK_SYSTEM = 0, TASK_SERVICE = 1, TASK_WORKFLOW = 2, TASK_WEB = 3, TASK_UI = 4, TASK_SCRIPT = 5, TASK_DECISION = 6, TASK_MAP = 7, TASK_REDUCE = 8, TASK_FILTER = 9, TASK_TERMINAL = 10;
const EDIT_TASK = 1, EDIT_WORKFLOW = 0, EDIT_DATATYPE = 3;

const NODE_PROTOCOL = "http:", NODE_HOST = "localhost", NODE_PORT = "5000"
const REGISTRY_PROTOCOL = "http:", REGISTRY_HOST = "localhost", REGISTRY_PORT = "5001"

class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataTypes: [
                {
                    id: 1,
                    base: DATATYPE_INT,
                    title: "linear measurement"
                },
                {
                    id: 3,
                    base: DATATYPE_INT,
                    title: "time"
                },
                {
                    id: 2,
                    base: DATATYPE_VECTOR,
                    title: "vector measurement",
                    subDataTypeId: 1
                },
                {
                    id: 4,
                    base: DATATYPE_MAP,
                    title: "IMU data",
                    subDataTypes: [
                        { title: "acceleration", subDataTypeId: 2 },
                        { title: "gyro", subDataTypeId: 2 },
                        { title: "time", subDataTypeId: 3 }
                    ]
                },
                {
                    id: 5,
                    base: DATATYPE_INT,
                    title: "decision"
                },
                {
                    id: 6,
                    base: DATATYPE_VECTOR,
                    title: "IMU dataframe",
                    subDataTypeId: 4
                },
            ],
            tasks: [
                {
                    id: 1,
                    title: "Detect Gesture",
                    inputDataTypeId: 6,
                    outputDataTypeId: 5,
                    type: TASK_SCRIPT,
                }
            ],
            taskInstances: [
                {
                    id: 1,
                    taskId: 0,
                    type: TASK_TERMINAL,
                    title: "start",
                    inputDataTypeId: 0,
                    outputDataTypeId: 1,
                    screenX: 300,
                    screenY: 50
                },
                {
                    id: 2,
                    taskId: 0,
                    type: TASK_TERMINAL,
                    title: "end",
                    inputDataTypeId: 2,
                    outputDataTypeId: 0,
                    screenX: 300,
                    screenY: 650
                }
            ],
            services: [],
            workflows: [],
            edges:[],
            editor: EDIT_WORKFLOW
        }
        this.setState.bind(this);
    }

    componentDidMount() {
        (async () => {
            let workflows = await (await fetch(NODE_PROTOCOL + "//" + NODE_HOST + ":" + NODE_PORT + "/workflow")).json()
            console.dir(workflows)
            let services = await (await fetch(REGISTRY_PROTOCOL + "//" + REGISTRY_HOST + ":" + REGISTRY_PORT + "/uniformservice")).json()
            console.dir(services)
            let tasks = await (await fetch(NODE_PROTOCOL + "//" + NODE_HOST + ":" + NODE_PORT + "/task")).json()
            console.dir(tasks)
            let dataTypes = await (await fetch(REGISTRY_PROTOCOL + "//" + REGISTRY_HOST + ":" + REGISTRY_PORT + "/datatype")).json()
            console.dir(dataTypes)
            let taskInstances = await (await fetch(NODE_PROTOCOL + "//" + NODE_HOST + ":" + NODE_PORT + "/workflow/"+this.props.workflowId+"/taskInstance")).json()
            console.dir(taskInstances)
            let edges = await (await fetch(NODE_PROTOCOL + "//" + NODE_HOST + ":" + NODE_PORT + "/workflow/"+this.props.workflowId+"/edge")).json()
            console.dir(edges)
            this.setState({ workflows,services,edges,tasks,dataTypes,taskInstances })
        })();

    }

    postDataType(dataType) {
        (async () => {
            let dataTypes = this.state.dataTypes;
            let res = await (await fetch(REGISTRY_PROTOCOL + "//" + REGISTRY_HOST + ":" + REGISTRY_PORT + "/datatype/" + dataType.id, { method: "POST", body: JSON.stringify(dataType) })).json()
            if (dataType.id === 0) {
                dataTypes.push(res)
            } else {
                dataTypes = dataTypes.map(dataType => { if (dataType.id == res.id) return res; return dataType; });
            }
            this.setState({ dataTypes })
        })()
    }

    deleteDataType(dataTypeId) {
        console.dir(dataTypeId)
        //TODO
    }

    postTask(task) {
        (async () => {
            let tasks = this.state.tasks;
            let res = await (await fetch(NODE_PROTOCOL + "//" + NODE_HOST + ":" + NODE_PORT + "/task/" + task.id, { method: "POST", body: JSON.stringify(task) })).json()
            if (task.id === 0) {
                tasks.push(res)
            } else {
                tasks = tasks.map(task => { if (task.id == res.id) return res; return task; });
            }
            this.setState({ tasks })
        })()
    }

    deleteTask(taskId) {
        (async () => {
            let res = await (await fetch(NODE_PROTOCOL+"//" + NODE_HOST + ":"+NODE_PORT+"/task/" + taskId, { method: "DELETE" })).json()
            let tasks = this.state.tasks.filter(task => task.id != res.id)
            this.setState({ tasks })
        })()
    }


    postTaskInstance(task) {
        (async () => {
            let taskInstances = this.state.taskInstances;
            task.workflowId=this.props.workflowId;
            this.setState({ taskInstances:taskInstances.map(taskInstance => { if (taskInstance.id == task.id) return task; return taskInstance; }) })
            let res = await (await fetch(NODE_PROTOCOL + "//" + NODE_HOST + ":" + NODE_PORT + "/taskInstance/" + task.id, { method: "POST", body: JSON.stringify(task) })).json()
            if (task.id === 0) {
                taskInstances.push(res)
            } else {
                taskInstances = taskInstances.map(taskInstance => { if (taskInstance.id == res.id) return res; return taskInstance; });
            }
            this.setState({ taskInstances })
        })()
    }

    deleteTaskInstance(taskId) {
        (async () => {
            let res = await (await fetch(NODE_PROTOCOL+"//" + NODE_HOST + ":"+NODE_PORT+"/taskInstance/" + taskId, { method: "DELETE" })).json()
            let taskInstances = this.state.taskInstances.filter(task => task.id != res.id)
            let edges = await (await fetch(NODE_PROTOCOL + "//" + NODE_HOST + ":" + NODE_PORT + "/workflow/"+this.props.workflowId+"/edge")).json()
            this.setState({ taskInstances,edges });
        })()
    }

    postEdge(edge,callback) {
        (async () => {
            let edges = this.state.edges;
            edge.workflowId=this.props.workflowId;
            this.setState({ edges:edges.map(edge2 => { if (edge2.id == edge.id) return edge; return edge2; }) })
            let res = await (await fetch(NODE_PROTOCOL + "//" + NODE_HOST + ":" + NODE_PORT + "/edge/" + edge.id, { method: "POST", body: JSON.stringify(edge) })).json()
            if (edge.id === 0) {
                edges.push(res)
            } else {
                edges = edges.map(edge => { if (edge.id == res.id) return res; return edge; });
            }
            this.setState({ edges })
            callback(edges);
        })()
    }

    deleteEdge(edgeId,callback) {
        (async () => {
            let res = await (await fetch(NODE_PROTOCOL+"//" + NODE_HOST + ":"+NODE_PORT+"/edge/" + edgeId, { method: "DELETE" })).json()
            let edges = this.state.edges.filter(edge => edge.id != res.id)
            this.setState({ edges })
            callback(edges)
        })()
    }


    render() {
        return (
            <Surface style={styles.editor}>
                <Surface style={styles.topbar}>
                    <IconButton icon="code-array" color={this.state.editor == EDIT_DATATYPE ? "red" : null} onPress={() => this.setState({ editor: this.state.editor == EDIT_DATATYPE ? EDIT_WORKFLOW : EDIT_DATATYPE })} />
                    <IconButton icon="code-not-equal-variant" color={this.state.editor == EDIT_TASK ? "red" : null} onPress={() => this.setState({ editor: this.state.editor == EDIT_TASK ? EDIT_WORKFLOW : EDIT_TASK })} />
                </Surface>
                {
                    (() => {
                        switch (this.state.editor) {
                            case EDIT_DATATYPE:
                                return <DataTypeEdit style={styles.editorpanel} onDeleteDataType={dataType => this.deleteDataType(dataType)} onSaveDataType={dataType => this.postDataType(dataType)} dataTypes={this.state.dataTypes} />
                            case EDIT_TASK:
                                return <TaskEdit style={styles.editorpanel} onDeleteTask={task => this.deleteTask(task)} onSaveTask={dataType => this.postTask(dataType)} services={this.state.services} workflows={this.state.workflows} tasks={this.state.tasks} dataTypes={this.state.dataTypes} />
                            default:
                            case EDIT_WORKFLOW:
                                return <WorkflowEdit 
                                deleteTaskInstance={(taskId,cb)=>this.deleteTaskInstance(taskId)} 
                                postTaskInstance={(taskInstance)=>this.postTaskInstance(taskInstance)} 
                                postEdge={(edge,cb)=>this.postEdge(edge,cb)}
                                deleteEdge={(edge,cb)=>this.deleteEdge(edge,cb)}
                                edges={this.state.edges}
                                taskInstances={this.state.taskInstances} 
                                style={styles.editorpanel} 
                                services={this.state.services} 
                                workflows={this.state.workflows} 
                                tasks={this.state.tasks} 
                                dataTypes={this.state.dataTypes} 
                                />

                        }
                    })()
                }
            </Surface>
        );
    }
}

const styles = StyleSheet.create({
    topbar: {
        flexDirection: 'row',
    },
    editorpanel: {
        flex: 1,
    },
    editor: {
        flex: 1
    }
});

export default withTheme(Editor);