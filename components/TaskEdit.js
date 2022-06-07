import { Avatar, Button, Caption, Card, Checkbox, Divider, Drawer, FAB, Headline, IconButton, List, RadioButton, Surface, Text, TextInput, Title, withTheme } from "react-native-paper";
import React, { useState } from 'react';
import { StyleSheet, View } from "react-native";
import DropDown from "react-native-paper-dropdown";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";


const TASK_SYSTEM = 0, TASK_SERVICE = 1, TASK_WORKFLOW = 2, TASK_WEB = 3, TASK_UI = 4, TASK_SCRIPT = 5, TASK_DECISION = 6, TASK_MAP = 7, TASK_REDUCE = 8, TASK_FILTER = 9, TASK_TERMINAL = 10;

function TaskEdit(props) {
    let [selected, setSelected] = useState(null);
    let [showDropDown1, setShowDropDown1] = useState(false);
    let [showDropDown2, setShowDropDown2] = useState(false);
    let [showDropDown3, setShowDropDown3] = useState(false);

    return <View style={styles.editor}>
        <Drawer.Section title="Tasks">
            <Drawer.Item icon="plus" key={0} active={selected && 0 == selected.id} label="New" onPress={() => setSelected(
                {
                    id: 0,
                    title: "",
                    inputDataTypeId: 0,
                    outputDataTypeId: 0,
                    type: 0
                }
            )} />
            {
                props.tasks.map(
                    task => <Drawer.Item icon="code-tags" key={task.id} active={selected && task.id == selected.id} label={task.title} onPress={() => setSelected(task)} />
                )
            }
        </Drawer.Section>
        {
            selected
                ?
                <View style={styles.formContainer}>
                    <Headline style={{ textAlign: "center" }}>{selected.title}</Headline>
                    <View style={styles.form}>
                        <Surface style={styles.formPartition}>
                            <TextInput label="Name" value={selected.title} onChangeText={newValue => setSelected(oldValue => ({ ...oldValue, title: newValue }))} />
                            <RadioButton.Group onValueChange={newValue => setSelected(oldValue => ({ ...oldValue, type: newValue }))} value={selected.type}>
                                <Caption>Base DataType</Caption>
                                <View>
                                    <RadioButton.Item label="System Program" value={TASK_SYSTEM} />
                                </View>
                                <View>
                                    <RadioButton.Item label="Service" value={TASK_SERVICE} />
                                </View>
                                <View>
                                    <RadioButton.Item label="Workflow" value={TASK_WORKFLOW} />
                                </View>
                                <View>
                                    <RadioButton.Item label="Web Service" value={TASK_WEB} />
                                </View>
                                <View>
                                    <RadioButton.Item label="User Interaction" value={TASK_UI} />
                                </View>
                                <View>
                                    <RadioButton.Item label="Script" value={TASK_SCRIPT} />
                                </View>
                                <View>
                                    <RadioButton.Item label="Decision Operation" value={TASK_DECISION} />
                                </View>
                                {/* <View>
                                    <RadioButton.Item label="Map Operation" value={TASK_MAP} />
                                </View>
                                <View>
                                    <RadioButton.Item label="Reduce Operation" value={TASK_REDUCE} />
                                </View> */}
                            </RadioButton.Group>
                            <DropDown
                                label="Input DataType"
                                value={selected.inputDataTypeId}
                                list={[{ label: "None", value: 0 }].concat(props.dataTypes.map(dataType => {
                                    return { label: dataType.title, value: dataType.id }
                                }))}
                                setValue={newValue => setSelected(oldValue => ({ ...oldValue, inputDataTypeId: newValue }))}
                                visible={showDropDown1}
                                showDropDown={() => setShowDropDown1(true)}
                                onDismiss={() => setShowDropDown1(false)}
                            />
                            <DropDown
                                label="Output DataType"
                                value={selected.outputDataTypeId}
                                list={[{ label: "None", value: 0 }].concat(
                                    selected.type == TASK_DECISION ? [] : props.dataTypes.map(dataType => {
                                        return { label: dataType.title, value: dataType.id }
                                    }))}
                                setValue={newValue => setSelected(oldValue => ({ ...oldValue, outputDataTypeId: newValue }))}
                                visible={showDropDown2}
                                showDropDown={() => setShowDropDown2(true)}
                                onDismiss={() => setShowDropDown2(false)}
                            />
                        </Surface>
                        {
                            selected.type == TASK_SYSTEM
                                ?
                                <Surface style={styles.formPartition}>
                                    <TextInput label="Command" value={selected.command ? selected.command : ""} onChangeText={newValue => setSelected(oldValue => ({ ...oldValue, command: newValue }))} />
                                </Surface>
                                :
                                selected.type == TASK_SERVICE
                                    ?
                                    <Surface style={styles.formPartition}>
                                        <DropDown
                                            label="Service"
                                            value={selected.uniformServiceId}
                                            list={props.services.map(service => {
                                                return { label: service.title, value: service.id }
                                            })}
                                            setValue={newValue => setSelected(oldValue => ({ ...oldValue, uniformServiceId: newValue }))}
                                            visible={showDropDown3}
                                            showDropDown={() => setShowDropDown3(true)}
                                            onDismiss={() => setShowDropDown3(false)}
                                        />
                                    </Surface>
                                    :
                                    selected.type == TASK_WORKFLOW
                                        ?
                                        <Surface style={styles.formPartition}>
                                            <DropDown
                                                label="Workflow"
                                                value={selected.workflowId}
                                                list={props.workflows.map(workflow => {
                                                    return { label: workflow.title, value: workflow.id }
                                                })}
                                                setValue={newValue => setSelected(oldValue => ({ ...oldValue, workflowId: newValue }))}
                                                visible={showDropDown3}
                                                showDropDown={() => setShowDropDown3(true)}
                                                onDismiss={() => setShowDropDown3(false)}
                                            />
                                        </Surface>
                                        :
                                        selected.type == TASK_DECISION
                                            ||
                                            selected.type == TASK_MAP
                                            ||
                                            selected.type == TASK_REDUCE
                                            ||
                                            selected.type == TASK_FILTER
                                            ?
                                            <Surface style={styles.formPartition}>
                                                <DropDown
                                                    label="Sub-Task"
                                                    value={selected.subTaskId}
                                                    list={props.tasks.map(task => {
                                                        return { label: task.title, value: task.id }
                                                    }).filter(task => task.value != selected.id)}
                                                    setValue={newValue => setSelected(oldValue => ({ ...oldValue, subTaskId: newValue }))}
                                                    visible={showDropDown3}
                                                    showDropDown={() => setShowDropDown3(true)}
                                                    onDismiss={() => setShowDropDown3(false)}
                                                />
                                            </Surface>
                                            :
                                            selected.type == TASK_WEB
                                                ?
                                                <Surface style={styles.formPartition}>
                                                    <TextInput label="URL" value={selected.url ? selected.url : ""} onChangeText={newValue => setSelected({ ...selected, url: newValue })} />
                                                    <TextInput label="METHOD" value={selected.method ? selected.method : "GET"} onChangeText={newValue => setSelected(oldValue => ({ ...oldValue, method: newValue }))} />
                                                    <Checkbox.Item label="Send data in request body?" status={selected.sendBody ? 'checked' : 'unchecked'} onPress={() => setSelected(oldValue => ({ ...oldValue, sendBody: !selected.sendBody }))} />
                                                </Surface>
                                                :
                                                selected.type == TASK_SCRIPT
                                                    ?
                                                    <Surface style={styles.formPartition}>
                                                        <Caption>Python Code</Caption>
                                                        <CodeMirror
                                                            onChange={newValue => setSelected(oldValue => ({ ...oldValue, code: newValue }))}
                                                            value={selected.code ? selected.code : "# your code goes here ...\n# `input` variable contains the input\n# output must be stored in the `output` variable\n"}
                                                            extensions={[python()]}
                                                        />
                                                    </Surface>
                                                    :
                                                    null

                        }
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "center" }}>
                        <Button icon="check" color="green" onPress={() => {
                            props.onSaveTask(selected)
                            if (selected.id == 0)
                                setSelected({
                                    id: 0,
                                    title: "",
                                    inputDataTypeId: 0,
                                    outputDataTypeId: 0,
                                    type: 0
                                })
                        }}>Save</Button>
                        {
                            selected.id != 0 && props.onDeleteTask
                                ?
                                <Button icon="close" color="red" onPress={() => {
                                    props.onDeleteTask(selected.id)
                                    setSelected({
                                        id: 0,
                                        title: "",
                                        inputDataTypeId: 0,
                                        outputDataTypeId: 0,
                                        type: 0
                                    })
                                }}>Delete</Button>
                                :
                                null
                        }
                    </View>
                </View>
                :
                <View style={styles.notSelectedMessage}>
                    <Headline style={{ color: 'gray' }}>Please select a Task to edit from the left menu, or create a new one!</Headline>
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
        justifyContent: 'center'
    },
    formPartition: {
        margin: 8,
        padding: 8
    }
});

export default withTheme(TaskEdit);
