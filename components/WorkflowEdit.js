import { Avatar, Button, Caption, Card, Checkbox, Divider, Drawer, FAB, Headline, IconButton, List, RadioButton, Surface, Text, TextInput, Title, withTheme } from "react-native-paper";
import React, { useRef, useState } from 'react';
import { StyleSheet, View } from "react-native";
import TaskView from "./TaskView";
import { Gesture, GestureDetector, PanGestureHandler, TapGestureHandler, TouchableOpacity } from "react-native-gesture-handler";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Svg from "react-native-svg";
import { Path } from "react-native-svg";
import { G } from "react-native-svg";
import DropDown from "react-native-paper-dropdown";


const TASK_SYSTEM = 0, TASK_SERVICE = 1, TASK_WORKFLOW = 2, TASK_WEB = 3, TASK_UI = 4, TASK_SCRIPT = 5, TASK_DECISION = 6, TASK_MAP = 7, TASK_REDUCE = 8, TASK_FILTER = 9, TASK_TERMINAL = 10;

let EdgeView = (props) => <G >
    <Path
        style={{ stroke: props.color, fill: 'none' }}
        strokeWidth={3}
        d={
            props.entry.taskInstance1.id == props.entry.taskInstance2.id
                ?
                ("M" + props.entry.startX + " " + props.entry.startY + "V" + (props.entry.startY + 25) + "h100V" + (props.entry.endY - 25) + "H" + props.entry.endX + "V" + props.entry.endY)
                :
                props.entry.startY < props.entry.endY
                    ?
                    ("M" + props.entry.startX + " " + props.entry.startY + "V" + ((props.entry.startY + props.entry.endY) / 2) + "H" + props.entry.endX + "V" + props.entry.endY)
                    :
                    ("M" + props.entry.startX + " " + props.entry.startY + "V" + (props.entry.startY + 25) + "H" + ((props.entry.startX + props.entry.endX) / 2) + "V" + (props.entry.endY - 25) + "H" + props.entry.endX + "V" + props.entry.endY)
        }
    />
    <Path
        style={{ stroke: props.color }}
        strokeWidth={3}
        d={"M" + props.entry.endX + " " + props.entry.endY + "L" + (props.entry.endX - 5) + " " + (props.entry.endY - 5) + "H" + (props.entry.endX + 5) + "z"}
    />
</G>;

let allPossibleIndices = (dataTypeId, dataTypes) => {
    let id = 0;
    let dataTypesLeft = [dataTypes.reduce((prev, dataType) => dataType.id == dataTypeId ? {
        dataType,
        index: { value: id++, label: "Root", dataIndex: [] }
    } : prev, null)];
    let addressableDataTypes = [];
    while (dataTypesLeft.length > 0) {
        let addressableDataType = dataTypesLeft.pop();
        if (addressableDataType) {
            if (addressableDataType.dataType.length)
                for (var i = 0; i < addressableDataType.dataType.length; i++) {
                    if (addressableDataType.dataType.subDataTypes) {
                        addressableDataType.dataType.subDataTypes.forEach((subDataType, a) => {
                            let addressableSubDataType = dataTypes.reduce((prev, dataType) => dataType.id == subDataType.subDataTypeId ? {
                                dataType,
                                index: { value: id++, label: addressableDataType.index.label + "[" + (i + 1) + "] ⮕ " + subDataType.title, dataIndex: addressableDataType.index.dataIndex.concat([i + 1, a + 1]) }
                            } : prev, null)
                            dataTypesLeft.push(addressableSubDataType);
                        });
                    }
                }
            addressableDataTypes.push(addressableDataType);
        }
        else {
            addressableDataTypes.push({
                dataType: null,
                index: { value: 0, label: "None", dataIndex: [] }
            });
        }
    }
    return addressableDataTypes;
}

function WorkflowEdit(props) {
    let [selectedTaskList, setSelectedTaskList] = useState(null);
    let [graphPanelOffest, setGraphPanelOffset] = useState({ x: 0, y: 0 });
    let [graphPanelOffestStart, setGraphPanelOffsetStart] = useState({ x: 0, y: 0 });
    let [selectedTaskInstance, setSelectedTaskInstance] = useState(null);
    let [edgeStart, selectEdgeStart] = useState(null);
    let [edgeEnd, selectEdgeEnd] = useState(null);
    let [edgeStartIndex, selectEdgeStartIndex] = useState(null);
    let [edgeEndIndex, selectEdgeEndIndex] = useState(null);
    let [selectedEntry, setSelectedEntry] = useState(null);
    let [showDropDown1, setShowDropDown1] = useState(false);
    let [showDropDown2, setShowDropDown2] = useState(false);
    let prepareEntryForScreen = entry => {
        entry.startX = graphPanelOffestStart.x + entry.taskInstance1.screenX + (entry.isNegEdge ? 190 : 100);
        entry.startY = graphPanelOffestStart.y + entry.taskInstance1.screenY + (entry.isNegEdge ? 50 : 90);
        entry.endX = graphPanelOffestStart.x + entry.taskInstance2.screenX + 100;
        entry.endY = graphPanelOffestStart.y + entry.taskInstance2.screenY;
        entry.allPossibleIndices1 = allPossibleIndices(entry.taskInstance1.outputDataTypeId, props.dataTypes);
        entry.allPossibleIndices2 = allPossibleIndices(entry.taskInstance2.inputDataTypeId, props.dataTypes);
        return entry;
    };
    let reducedEdges = (edges) => edges.reduce((prev, edge) => {
        let isNegEdge = edge.dataIndex1.length == 2 && edge.dataIndex1[0] == 0 && edge.dataIndex1[1] == 0;
        let entry = prev.reduce((prev2, entry2) => {
            return (entry2.taskInstance1.id == edge.taskInstanceId1
                &&
                entry2.taskInstance2.id == edge.taskInstanceId2
                &&
                isNegEdge == entry2.isNegEdge)
                ?
                entry2
                :
                prev2
        },
            null);
        if (!entry) {
            entry = {
                id: prev.length + 1,
                taskInstance1: props.taskInstances.reduce((prev2, task) => task.id == edge.taskInstanceId1 ? task : prev2, null),
                taskInstance2: props.taskInstances.reduce((prev2, task) => task.id == edge.taskInstanceId2 ? task : prev2, null),
                dataIndexPairs: [{
                    edgeId: edge.id,
                    dataIndex1: edge.dataIndex1,
                    dataIndex2: edge.dataIndex2
                }],
                isNegEdge
            };
            prev.push(prepareEntryForScreen(entry));
        }
        else {
            prev = prev.map(entry => {
                if (entry.taskInstance1.id == edge.taskInstanceId1 && entry.taskInstance2.id == edge.taskInstanceId2 && isNegEdge == entry.isNegEdge) {
                    entry.dataIndexPairs.push({
                        edgeId: edge.id,
                        dataIndex1: edge.dataIndex1,
                        dataIndex2: edge.dataIndex2
                    })
                }
                return entry
            })
        }
        return prev;
    }, []);
    let selectEdge = (edgeStart, edgeEnd, reducedEdges) => {
        let entry = reducedEdges.reduce(
            (prev, entry) => (entry.taskInstance1.id == edgeStart[0]) && (entry.taskInstance2.id == edgeEnd[0]) && (entry.isNegEdge == (edgeStart.length > 1 && edgeStart[1] == 0))
                ? entry
                : prev
            , prepareEntryForScreen({
                id: 0,
                taskInstance1: props.taskInstances.reduce((prev2, task) => task.id == edgeStart[0] ? task : prev2, null),
                taskInstance2: props.taskInstances.reduce((prev2, task) => task.id == edgeEnd[0] ? task : prev2, null),
                dataIndexPairs: [],
                isNegEdge: (edgeStart.length > 1 && edgeStart[1] == 0)
            }));
        setSelectedEntry(entry);
        console.log(entry);

        /*
        props.postEdge({
            id: 0,
            taskInstanceId1: edgeStart[0],
            taskInstanceId2: edgeEnd[0],
            dataIndex1: edgeStart.length > 1 ? [0, edgeStart[1]] : [],
            dataIndex2: []
        })*/
        selectEdgeEnd(null)
        selectEdgeStart(null)
    }
    return <View style={styles.editor}>
        <View style={styles.taskList}>
            {
                props.tasks.map(task => <TouchableOpacity
                    key={task.id}
                    onPress={() => { setSelectedTaskList(prev => prev && prev.id == task.id ? null : task) }}
                >
                    <TaskView
                        selected={selectedTaskList && selectedTaskList.id == task.id}
                        {...task}
                    />
                </TouchableOpacity>)}
        </View>
        <View style={styles.graphPanel}>
            <GestureDetector
                gesture={
                    Gesture.Tap().onEnd(event => {
                        if (props.postTaskInstance && selectedTaskList) {
                            let taskInstance = { ...selectedTaskList, id: 0, taskId: selectedTaskList.id, screenX: event.x - 50-graphPanelOffestStart.x, screenY:  event.y - 50-graphPanelOffestStart.y };
                            props.postTaskInstance(taskInstance);
                        }
                        setSelectedTaskList(null);
                        setSelectedEntry(null);

                        console.dir(event)
                    })
                }
            >

                <View
                    style={
                        {
                            flex: 1
                        }
                    }
                >
                    {
                        props.taskInstances.map(
                            taskInstance => <GestureDetector
                                gesture={
                                    Gesture.Pan()
                                        .onUpdate(
                                            event => {
                                                setSelectedTaskInstance({
                                                    ...taskInstance,
                                                    screenX: taskInstance.screenX + event.translationX,
                                                    screenY: taskInstance.screenY + event.translationY
                                                })
                                            }
                                        ).onEnd(
                                            event => {
                                                if (props.postTaskInstance && selectedTaskInstance) {
                                                    props.postTaskInstance(selectedTaskInstance);
                                                }
                                                setSelectedTaskInstance(null);
                                            })
                                }
                            >
                                <TaskView
                                    style={
                                        selectedTaskInstance && selectedTaskInstance.id == taskInstance.id
                                            ?
                                            {
                                                position: 'absolute',
                                                top: graphPanelOffestStart.y + selectedTaskInstance.screenY,
                                                left: graphPanelOffestStart.x + selectedTaskInstance.screenX
                                            }
                                            :
                                            {
                                                position: 'absolute',
                                                top: graphPanelOffestStart.y + taskInstance.screenY,
                                                left: graphPanelOffestStart.x + taskInstance.screenX
                                            }}
                                    {...taskInstance}
                                    deleteTaskInstance={props.deleteTaskInstance}
                                    selectEdgeStart={edgeEnd ? (edgeStart) => selectEdge(edgeStart, edgeEnd, reducedEdges(props.edges)) : !edgeStart ? selectEdgeStart : null}
                                    selectEdgeEnd={edgeStart ? (edgeEnd) => selectEdge(edgeStart, edgeEnd, reducedEdges(props.edges)) : !edgeEnd ? selectEdgeEnd : null}
                                />
                            </GestureDetector>
                        )
                    }
                    <Svg height={'100%'} width={'100%'} style={{ flex: 1 }}>

                        {
                            reducedEdges(props.edges).map(entry =>
                                !(selectedEntry && (selectedEntry.taskInstance1.id == entry.taskInstance1.id) && (selectedEntry.taskInstance2.id == entry.taskInstance2.id) && (selectedEntry.isNegEdge == entry.isNegEdge))
                                    ?
                                    <EdgeView entry={entry} color="#aaa" />
                                    :
                                    null
                            )
                        }
                        {
                            selectedEntry
                                ?
                                <EdgeView entry={selectedEntry} color="#f00" />
                                :
                                null
                        }
                    </Svg>

                </View>
            </GestureDetector>
            <GestureDetector
                gesture={Gesture.Pan()
                    .onEnd(event => setGraphPanelOffset(graphPanelOffestStart))
                    .onUpdate(
                        event => {
                            setGraphPanelOffsetStart({
                                x: graphPanelOffest.x + event.translationX,
                                y: graphPanelOffest.y + event.translationY
                            })
                        }
                    )}
            >
                <View style={{ position: 'absolute', bottom: 5, left: '50%', zIndex: 10, padding: 5 }}>
                    <MaterialCommunityIcons color={props.theme.colors.text} size={32} name="cursor-move" />
                </View>
            </GestureDetector>
        </View>
        {
            selectedEntry
                ?
                <View style={styles.edgeEditor}>
                    <List.Section>
                        <List.Subheader>{selectedEntry.taskInstance1.title} <MaterialCommunityIcons name="arrow-right-thin" /> {selectedEntry.taskInstance2.title} Edge DataType Mapping</List.Subheader>
                        {
                            selectedEntry.dataIndexPairs.map(dataIndexPair => <List.Item
                                title={
                                    <View style={{ flexDirection: 'row', alignItems:'center', justifyContent:'center' }}>
                                        <Text>
                                            {selectedEntry.allPossibleIndices1.reduce(
                                                (prev, index) => JSON.stringify(index.index.dataIndex) === JSON.stringify(dataIndexPair.dataIndex1)
                                                    ?
                                                    index.index.label
                                                    : prev
                                                , "unknown"
                                            )}
                                        </Text>
                                        <MaterialCommunityIcons name="arrow-right-bold" size={24} />
                                        <Text>
                                            {selectedEntry.allPossibleIndices2.reduce(
                                                (prev, index) => JSON.stringify(index.index.dataIndex) === JSON.stringify(dataIndexPair.dataIndex2)
                                                    ?
                                                    index.index.label
                                                    : prev
                                                , "unknown"
                                            )}
                                        </Text>
                                    </View>
                                }
                                right={() => <IconButton
                                    icon="close-circle"
                                    color="red"
                                    onPress={() => {
                                        props.deleteEdge(dataIndexPair.edgeId, (edges) => {
                                            selectEdge(selectedEntry.isNegEdge
                                                ?
                                                [selectedEntry.taskInstance1.id, 0]
                                                :
                                                [selectedEntry.taskInstance1.id],
                                                [selectedEntry.taskInstance2.id],
                                                reducedEdges(edges))
                                        });
                                    }}
                                />}
                            />)
                        }
                        <List.Item
                            title={
                                <View style={{ flexDirection: 'row', alignItems:'center', justifyContent:'center',flex:1 }}>
                                    <DropDown
                                        label="Source Index"
                                        value={edgeStartIndex}
                                        list={selectedEntry.allPossibleIndices1.map(addressableDataTypes => addressableDataTypes.index)}
                                        setValue={selectEdgeStartIndex}
                                        visible={showDropDown1}
                                        showDropDown={() => setShowDropDown1(true)}
                                        onDismiss={() => setShowDropDown1(false)}
                                    />
                                    <MaterialCommunityIcons name="arrow-right-bold" size={24} />
                                    <DropDown
                                        label="Destination Index"
                                        value={edgeEndIndex}
                                        list={selectedEntry.allPossibleIndices2.map(addressableDataTypes => addressableDataTypes.index)}
                                        setValue={selectEdgeEndIndex}
                                        visible={showDropDown2}
                                        showDropDown={() => setShowDropDown2(true)}
                                        onDismiss={() => setShowDropDown2(false)}
                                    />
                                </View>
                            }
                            right={() => <IconButton
                                icon="plus"
                                color="green"
                                onPress={() => {
                                    props.postEdge({
                                        id: 0,
                                        taskInstanceId1: selectedEntry.taskInstance1.id,
                                        taskInstanceId2: selectedEntry.taskInstance2.id,
                                        dataIndex1: selectedEntry.isNegEdge ?
                                            [0, 0]
                                            :
                                            selectedEntry.allPossibleIndices1.reduce(
                                                (prev, current) => edgeStartIndex == current.index.value
                                                    ?
                                                    current.index.dataIndex
                                                    : prev,
                                                []
                                            ),
                                        dataIndex2: selectedEntry.allPossibleIndices2.reduce((prev, current) => edgeEndIndex == current.index.value ? current.index.dataIndex : prev, [])
                                    }, (edges) => { selectEdge(selectedEntry.isNegEdge ? [selectedEntry.taskInstance1.id, 0] : [selectedEntry.taskInstance1.id], [selectedEntry.taskInstance2.id], reducedEdges(edges)) });
                                    selectEdgeStart(null);
                                    selectEdgeEnd(null);
                                }}
                            />}
                        />
                    </List.Section>
                </View>
                :
                null}
    </View >;
}

const styles = StyleSheet.create({
    editor: {
        flexDirection: 'row',
        flex: 1
    },
    taskList: {
        borderRightWidth: 1,

    },
    graphPanel: {
        flex: 1,
        padding: 10,
        overflow: 'hidden'
    },
    edgeEditor: {
        borderLeftWidth: 1,

    },
});

export default withTheme(WorkflowEdit);
