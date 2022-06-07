import { Avatar, Button, Card, FAB, Headline, IconButton, Surface, TextInput, withTheme } from "react-native-paper";
import React, { useState } from 'react';
import { StyleSheet, View } from "react-native";
import DropDown from "react-native-paper-dropdown";

function WorkflowList(props) {
    let [addWorkflow, setAddWorkflow] = useState(false);
    let [editWorkflow, setEditWorkflow] = useState(-1);
    let [workflowTitle, setWorkflowTitle] = useState("");
    let [makeService, setMakeService] = useState(-1);
    let [serviceTitle, setServiceTitle] = useState("");
    let [uniformServiceId, setUniformServiceId] = useState(0);
    let [inputDataTypeId, setInputDataTypeId] = useState(0);
    let [outputDataTypeId, setOutputDataTypeId] = useState(0);
    let [showDropDown1, setShowDropDown1] = useState(false);
    let [showDropDown2, setShowDropDown2] = useState(false);

    return <View style={styles.workflowlist}>
        <Headline style={{ color: props.theme.colors.primary }}>Your Workflows</Headline>
        <View style={styles.workflows}>
            {
                props.workflows ? props.workflows.map(workflow => editWorkflow == workflow.id ? <Card key={workflow.id} style={styles.workflow}>
                    <Card.Title style={styles.workflowtitle} left={props => <Avatar.Icon icon="sitemap" {...props} />} subtitle={workflow.title} title="Edit Workflow" />
                    <TextInput label="Workflow Title" value={workflowTitle} onChangeText={text => setWorkflowTitle(text)} />
                    <DropDown
                        label="Input DataType"
                        value={inputDataTypeId}
                        list={[{ label: "None", value: 0 }].concat(props.dataTypes.map(dataType => {
                            return { label: dataType.title, value: dataType.id }
                        }))}
                        setValue={setInputDataTypeId}
                        visible={showDropDown1}
                        showDropDown={() => setShowDropDown1(true)}
                        onDismiss={() => setShowDropDown1(false)}
                    />
                    <DropDown
                        label="Output DataType"
                        value={outputDataTypeId}
                        list={[{ label: "None", value: 0 }].concat(props.dataTypes.map(dataType => {
                            return { label: dataType.title, value: dataType.id }
                        }))}
                        setValue={setOutputDataTypeId}
                        visible={showDropDown2}
                        showDropDown={() => setShowDropDown2(true)}
                        onDismiss={() => setShowDropDown2(false)}
                    />
                    <Card.Actions>
                        <Button icon="check" color="green" onPress={() => { props.onEditWorkflow(workflow.id, workflowTitle, inputDataTypeId, outputDataTypeId); setEditWorkflow(-1); }}>Save</Button>
                    </Card.Actions>
                    <IconButton size={16} color="gray" onPress={() => setEditWorkflow(-1)} icon="close-circle" style={styles.workflowRemoveButton} />
                </Card> : makeService == workflow.id ? <Card key={workflow.id} style={styles.workflow}>
                    <Card.Title style={styles.workflowtitle} left={props => <Avatar.Icon icon="play-network" {...props} />} subtitle={workflow.title} title="Make Service" />
                    <TextInput label="Service Title" value={serviceTitle} onChangeText={text => setServiceTitle(text)} />
                    <DropDown
                        label="Uniform Service ID"
                        value={uniformServiceId}
                        list={[{ label: "Register New Service", value: 0 }].concat(props.uniformServices.map(service => {
                            return { label: service.title, value: service.id }
                        }))}
                        setValue={text => setUniformServiceId(text)}
                        visible={showDropDown2}
                        showDropDown={() => setShowDropDown2(true)}
                        onDismiss={() => setShowDropDown2(false)}
                    />
                    <Card.Actions>
                        <Button icon="check" color="green" onPress={() => { props.onMakeService(workflow, serviceTitle, uniformServiceId); setMakeService(-1); setUniformServiceId(0); }}>Save</Button>
                    </Card.Actions>
                    <IconButton size={16} color="gray" onPress={() => setMakeService(-1)} icon="close-circle" style={styles.workflowRemoveButton} />
                </Card> : <Card key={workflow.id} style={styles.workflow}>
                    <Card.Title style={styles.workflowtitle} left={props => <Avatar.Icon icon="sitemap" {...props} />} title={workflow.title} />
                    <Card.Actions>
                        {props.onStartWorkflow ? <Button icon="play" color="green" onPress={() => { props.onStartWorkflow(workflow.id); }}>Start</Button> : null}
                        {
                            props.onMakeService && props.onRemoveService && props.thisNode
                                ?
                                props.thisNode.services.reduce((prev, service) => prev || service.workflowId == workflow.id, false)
                                    ?
                                    <Button
                                        icon="close-network"
                                        color="red"
                                        onPress={
                                            () => { props.onRemoveService(workflow.id); }
                                        }>
                                        Remove Service
                                    </Button>
                                    :
                                    <View style={{ flexDirection: 'row' }}>
                                        {props.onEditorWorkflow ? <Button icon="pencil" onPress={() => { props.onEditorWorkflow(workflow); }}>Open in Editor</Button> : null}
                                        <Button
                                            icon="check-network"
                                            onPress={
                                                () => { setMakeService(workflow.id); setServiceTitle(""); setUniformServiceId(""); }
                                            }>
                                            Make Service
                                        </Button>
                                    </View>
                                :
                                null
                        }
                    </Card.Actions>
                    <View style={styles.workflowRemoveButton}>
                        {props.onEditWorkflow ? <IconButton color="gray" size={18} onPress={() => { setWorkflowTitle(workflow.title); setInputDataTypeId(workflow.inputDataTypeId); setOutputDataTypeId(workflow.outputDataTypeId); setEditWorkflow(workflow.id) }} icon="pencil-circle" /> : null}
                        {props.onRemoveWorkflow ? <IconButton color="red" size={18} onPress={() => props.onRemoveWorkflow(workflow.id)} icon="close-circle" /> : null}
                    </View>
                </Card>) : null
            }
            {props.onAddWorkflow ? addWorkflow ? <Card key={0} style={styles.workflow}>
                <Card.Title style={styles.workflowtitle} titleStyle={{ flexWrap: 'wrap', flexDirection: 'row' }} left={props => <Avatar.Icon icon="sitemap" {...props} />} title="Add Workflow" />
                <TextInput label="Workflow Title" value={workflowTitle} onChangeText={text => setWorkflowTitle(text)} />
                <DropDown
                    label="Input DataType"
                    value={inputDataTypeId}
                    list={[{ label: "None", value: 0 }].concat(props.dataTypes.map(dataType => {
                        return { label: dataType.title, value: dataType.id }
                    }))}
                    setValue={setInputDataTypeId}
                    visible={showDropDown1}
                    showDropDown={() => setShowDropDown1(true)}
                    onDismiss={() => setShowDropDown1(false)}
                />
                <DropDown
                    label="Output DataType"
                    value={outputDataTypeId}
                    list={[{ label: "None", value: 0 }].concat(props.dataTypes.map(dataType => {
                        return { label: dataType.title, value: dataType.id }
                    }))}
                    setValue={setOutputDataTypeId}
                    visible={showDropDown2}
                    showDropDown={() => setShowDropDown2(true)}
                    onDismiss={() => setShowDropDown2(false)}
                />
                <Card.Actions>
                    <Button icon="check" color="green" onPress={() => { props.onAddWorkflow(workflowTitle, inputDataTypeId, outputDataTypeId); setAddWorkflow(false); }}>Add</Button>
                </Card.Actions>
                <IconButton size={16} color="gray" onPress={() => setAddWorkflow(false)} icon="close-circle" style={styles.workflowRemoveButton} />
            </Card> : <FAB style={styles.addWorkflow} icon="plus" onPress={() => { setWorkflowTitle(""); setAddWorkflow(true) }} /> : null}
        </View>
    </View>;
}

const styles = StyleSheet.create({
    workflow: {
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        margin: 8,
        maxWidth: '100%'
    },
    workflows: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
    workflowtitle: {
        marginTop: 8,
        marginRight: 16
    },
    workflowlist: {
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        margin: 8
    },
    workflowRemoveButton: {
        flexDirection: 'row',
        position: 'absolute',
        top: -5,
        right: -5
    },
    addWorkflow: {
        margin: 8
    }
});

export default withTheme(WorkflowList);