import { Avatar, Button, Caption, Card, Divider, Drawer, FAB, Headline, IconButton, List, RadioButton, Subheading, Surface, Text, TextInput, Title, withTheme } from "react-native-paper";
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from "react-native";
import DropDown from "react-native-paper-dropdown";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DataEdit from "./DataEdit";
const DATATYPE_INT = 0, DATATYPE_FLOAT = 1, DATATYPE_TEXT = 2, DATATYPE_STRUCTURE = 3;

const STATE_QUEUED = 0, STATE_LOADED = 1, STATE_STARTED = 2, STATE_ENDED = 3, STATE_MARKED = 4, STATE_KILLED = -1, STATE_FAILED = -2

function ExecutionEdit(props) {
    let [selectedId, setSelected] = useState(null);
    let [showDropDown, setShowDropDown] = useState(false);
    return <View style={styles.editor}>
        <Drawer.Section title="Executions">
            {props.selectedExecution ? <Drawer.Item icon="plus" key={0} active={true} label="New" /> : null}
            {
                props.executions.map(
                    execution => <Drawer.Item
                        icon={execution.type == 1 ? "script-text-play" : execution.type == 2 ? "play-network" : "alert"}
                        key={execution.executionId}
                        active={execution.executionId == selectedId}
                        label={<View>
                            <Text>{execution.title}</Text>
                            <Caption>{new Date(parseFloat(execution.entryTime) * 1000).toString()}</Caption>
                        </View>}
                        onPress={
                            () => {
                                setSelected(null)
                                setTimeout(() => setSelected(execution.executionId), 50)
                            }
                        } />
                )
            }
        </Drawer.Section>
        {
            selectedId
                ?
                props.executions.reduce((previous, selected) =>
                    selected.executionId == selectedId
                        ?
                        <View style={{ flex: 1 }}>
                            <Headline>{selected.title}</Headline>
                            <Subheading>{
                                selected.executionState == STATE_QUEUED
                                    ?
                                    [<MaterialCommunityIcons name="clipboard-clock" size={18} />, " Queued"]
                                    :
                                    selected.executionState == STATE_LOADED
                                        ?
                                        [<MaterialCommunityIcons name="clipboard-check" size={18} />, " Loaded"]
                                        :
                                        selected.executionState == STATE_STARTED
                                            ?
                                            [
                                                <MaterialCommunityIcons name="play" size={18} />,
                                                " Started",
                                                selected.type == 1 ? <IconButton icon={"stop"} onPress={() => props.killWorkflow(selected.executionId)} /> : null
                                            ]
                                            :
                                            selected.executionState == STATE_ENDED
                                                ?
                                                [<MaterialCommunityIcons name="check" size={18} />, " Completed"]
                                                :
                                                selected.executionState == STATE_MARKED
                                                    ?
                                                    [<MaterialCommunityIcons name="check-all" size={18} />, " Completed and Marked"]
                                                    :
                                                    selected.executionState == STATE_FAILED
                                                        ?
                                                        [<MaterialCommunityIcons name="alert" size={18} />, " Failed"]
                                                        :
                                                        selected.executionState == STATE_KILLED
                                                            ?
                                                            [<MaterialCommunityIcons name="cancel" size={18} />, " Killed"]
                                                            :
                                                            null
                            }
                            </Subheading>
                            {
                                selected.entryTime
                                    ?
                                    <View>
                                        <Caption>Entry Time</Caption>
                                        <Text>{new Date(parseFloat(selected.entryTime) * 1000).toString()}</Text>
                                    </View>
                                    :
                                    null
                            }
                            {
                                selected.startTime
                                    ?
                                    <View>
                                        <Caption>Start Time</Caption>
                                        <Text>{new Date(parseFloat(selected.startTime) * 1000).toString()}</Text>
                                    </View>
                                    :
                                    null
                            }
                            {
                                selected.endTime
                                    ?
                                    <View>
                                        <Caption>End Time</Caption>
                                        <Text>{new Date(parseFloat(selected.endTime) * 1000).toString()}</Text>
                                    </View>
                                    :
                                    null
                            }
                            {
                                selected.ipAddress
                                    ?
                                    <View>
                                        <Caption>Remote Service Host</Caption>
                                        <Text>{selected.ipAddress}</Text>
                                    </View>
                                    :
                                    null
                            }
                            {
                                selected.id == 0
                                    ?
                                    <View style={{ flexDirection: 'row' }}>
                                    </View>
                                    : null
                            }
                            {
                                selected.inputDataId
                                    ?
                                    <DataEdit dataTypes={props.dataTypes} data={props.data} selected={props.data.reduce((prev, current) => {
                                        if (current.id == selected.inputDataId) {
                                            current.title = "Input Data"
                                            return current
                                        }
                                        else return prev
                                    }, null)} />
                                    :
                                    null
                            }
                            {
                                selected.outputDataId
                                    ?
                                    <DataEdit dataTypes={props.dataTypes} data={props.data} selected={props.data.reduce((prev, current) => {
                                        if (current.id == selected.outputDataId) {
                                            current.title = "Output Data"
                                            return current
                                        }
                                        else return prev
                                    }, null)} />
                                    :
                                    null
                            }

                        </View>
                        :
                        previous
                    ,
                    null
                )
                :
                <View style={styles.notSelectedMessage}>
                    <Headline style={{ color: 'gray' }}>Please select an Execution from the left menu, or create a new one!</Headline>
                </View>

        }
    </View>;
}

const styles = StyleSheet.create({
    editor: {
        flexDirection: 'row',
        flex: 1
    },
    form: {
        padding: 8,
        flexDirection: 'row',
        justifyContent: "center"
    },
    formContainer: {
        paddingTop: 16,
        flex: 1,
    },
    notSelectedMessage: {
        flex: 1,
        padding: 8,
        alignItems: 'center',
    },
    formPartition: {
        margin: 8,
        padding: 8
    }
});

export default withTheme(ExecutionEdit);
