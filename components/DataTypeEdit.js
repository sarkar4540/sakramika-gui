import { Avatar, Button, Caption, Card, Divider, Drawer, FAB, Headline, IconButton, List, RadioButton, Surface, Text, TextInput, Title, withTheme } from "react-native-paper";
import React, { useState } from 'react';
import { StyleSheet, View } from "react-native";
import DropDown from "react-native-paper-dropdown";
const DATATYPE_INT = 0, DATATYPE_FLOAT = 1, DATATYPE_TEXT = 2, DATATYPE_STRUCTURE = 3;

function DataTypeEdit(props) {
    let [selected, setSelected] = useState(null);
    let [showDropDown, setShowDropDown] = useState(false);
    let [subDataTypeName, setSubDataTypeName] = useState("");
    let [subDataTypeId, setSubDataTypeId] = useState(null);

    return <View style={styles.editor}>
        <Drawer.Section title="DataTypes">
            <Drawer.Item icon="plus" key={0} active={selected && 0 == selected.id} label="New" onPress={() => setSelected({ title: "", id: 0, base: DATATYPE_INT })} />
            {
                props.dataTypes.map(
                    dataType => <Drawer.Item icon="code-brackets" key={dataType.id} active={selected && dataType.id == selected.id} label={dataType.title} onPress={() => setSelected(dataType)} />
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
                            <TextInput label="Name" value={selected.title} onChangeText={newValue => setSelected({ ...selected, title: newValue })} />
                            <RadioButton.Group onValueChange={newValue => setSelected({ ...selected, base: newValue })} value={selected.base}>
                                <Caption>Base DataType</Caption>
                                <View>
                                    <RadioButton.Item label="Integer" value={DATATYPE_INT} />
                                </View>
                                <View>
                                    <RadioButton.Item label="Decimal" value={DATATYPE_FLOAT} />
                                </View>
                                <View>
                                    <RadioButton.Item label="Text" value={DATATYPE_TEXT} />
                                </View>
                                <View>
                                    <RadioButton.Item label="Structure" value={DATATYPE_STRUCTURE} />
                                </View>
                            </RadioButton.Group>
                        </Surface>
                        {
                            selected.base == DATATYPE_STRUCTURE
                                ?
                                <Surface style={styles.formPartition}>
                                    <TextInput value={selected.length} label="Length" onChangeText={newValue => setSelected({ ...selected, length: newValue })} />
                                    <List.Section>
                                        <List.Subheader>SubDataType Mappings</List.Subheader>
                                        {
                                            selected.subDataTypes
                                                ?
                                                selected.subDataTypes.map((subDataType, index) => <List.Item
                                                    title={subDataType.title + " [" + props.dataTypes.reduce((prev, dataType) => dataType.id == subDataType.subDataTypeId ? dataType : prev, null).title + "]"}
                                                    right={() => <IconButton icon="close-circle" color="red" onPress={() => {
                                                        let subDataTypes = selected.subDataTypes
                                                        if (subDataTypes instanceof Array) {
                                                            subDataTypes = subDataTypes.filter((s, index1) => index != index1)
                                                            setSelected({ ...selected, subDataTypes })
                                                        }

                                                    }} />}
                                                />)
                                                :
                                                null
                                        }
                                        <View style={{ flexDirection: "row" }}>
                                            <TextInput style={{ flex: 1 }} value={subDataTypeName} label="Title" onChangeText={setSubDataTypeName} />
                                            <DropDown style={{ flex: 1 }}
                                                label="SubDataType"
                                                value={subDataTypeId}
                                                list={props.dataTypes.map(dataType => {
                                                    return { label: dataType.title, value: dataType.id }
                                                }).filter(item => item.value != selected.id)}
                                                setValue={setSubDataTypeId}
                                                visible={showDropDown}
                                                showDropDown={() => setShowDropDown(true)}
                                                onDismiss={() => setShowDropDown(false)}
                                            />
                                            <IconButton icon="plus" color="green" onPress={() => {
                                                let subDataTypes = selected.subDataTypes
                                                if (!(subDataTypes instanceof Array)) {
                                                    subDataTypes = []
                                                }
                                                subDataTypes.push({ title: subDataTypeName, subDataTypeId })
                                                setSelected({ ...selected, subDataTypes })
                                                setSubDataTypeName("")
                                            }} />
                                        </View>
                                    </List.Section>
                                </Surface>
                                :
                                null

                        }
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "center" }}>
                        <Button icon="check" color="green" onPress={() => {
                            props.onSaveDataType(selected)
                            if (selected.id == 0)
                                setSelected({ title: "", id: 0, base: DATATYPE_INT })
                        }}>Save</Button>
                        {
                            selected.id != 0 && props.onDeleteDataType
                                ?
                                <Button icon="close" color="red" onPress={() => {
                                    props.onDeleteDataType(selected.id)
                                    setSelected({ title: "", id: 0, base: DATATYPE_INT })
                                }}>Delete</Button>
                                :
                                null
                        }
                    </View>
                </View>
                :
                <View style={styles.notSelectedMessage}>
                    <Headline style={{ color: 'gray' }}>Please select a DataType to edit from the left menu, or create a new one!</Headline>
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

export default withTheme(DataTypeEdit);
