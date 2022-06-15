import { Avatar, Button, Caption, Card, Divider, Drawer, FAB, Headline, IconButton, List, RadioButton, Surface, Text, TextInput, Title, withTheme } from "react-native-paper";
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from "react-native";
import DropDown from "react-native-paper-dropdown";
import { repositionTooltips } from "@uiw/react-codemirror";
const DATATYPE_INT = 0, DATATYPE_FLOAT = 1, DATATYPE_TEXT = 2, DATATYPE_STRUCTURE = 3;

let BaseDataView = (props) => {
    let [edit, setEdit] = useState(false)
    let [text, setText] = useState(props.data)
    console.log(props)
    return props.onChange && edit
        ?
        <View style={{ flexDirection: 'row' }}>
            <TextInput
                style={{ flex: 1 }}
                label={props.title}
                value={text}
                onChangeText={setText}
            />
            <IconButton icon="check" onPress={() => {
                props.onChange(props.index ? props.index : 0, text)
                setEdit(false)
            }} />
        </View>
        :
        <View >
            {
                props.title
                    ?
                    <Caption>
                        {props.title}
                    </Caption>
                    :
                    null
            }
            <View style={{ flexDirection: 'row' }}>
                <Text style={{ flex: 1 }}>
                    {text}

                </Text>
                {props.onChange ? <IconButton icon="pencil" size={18} onPress={() => setEdit(true)} /> : null}
            </View>
        </View>
}

//Add the DataViews in this dict 
let dataViews = {
    _1: (props) => {
        let [edit, setEdit] = useState(false)
        let [text, setText] = useState(props.data)
        console.log(props)
        return props.onChange && edit
            ?
            <View style={{ flexDirection: 'row' }}>
                <TextInput
                    style={{ flex: 1 }}
                    label={"Random Value"}
                    value={text}
                    onChangeText={setText}
                />
                <IconButton icon="check" onPress={() => {
                    props.onChange(props.index ? props.index : 0, text)
                    setEdit(false)
                }} />
            </View>
            :
            <View >
                <Caption>
                    Random Value
                </Caption>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ flex: 1 }}>
                        {text}

                    </Text>
                    {props.onChange ? <IconButton icon="pencil" size={18} onPress={() => setEdit(true)} /> : null}
                </View>
            </View>
    }
}

let DataView = (props) => {
    console.log(props.i);
    console.log(props);
    return dataViews.hasOwnProperty(props.dataTypeId)
        ?
        (() => {
            let DV = dataViews[props.dataTypeId];
            return <DV {...props} />
        })()
        :
        props.data instanceof Array
            ?
            <List.Accordion title={props.title}>
                {props.data.map((element, index) => <List.Accordion title={index + 1}>{
                    Object.keys(element).map(title => <DataView
                        i={props.i + 1}
                        title={title}
                        data={element[title].data}
                        index={element[title].index}
                        length={element[title].length}
                        dataTypeId={element[title].dataTypeId}
                        onChange={props.onChange}
                    />)
                }</List.Accordion>)}
            </List.Accordion>
            :
            typeof (props.data) == 'object'
                ?
                <DataView
                    i={props.i + 1}
                    title={props.title}
                    data={props.data.data}
                    index={props.data.index}
                    length={props.data.length}
                    dataTypeId={props.data.dataTypeId}
                    onChange={props.onChange}
                />
                :
                <BaseDataView {...props} />

}

let getObject = (data, dataTypes) => {
    let dataType = dataTypes.find(dataType => dataType.id == data.dataTypeId)
    if (dataType && data.values) {
        if (dataType['base'] == DATATYPE_STRUCTURE) {
            let elemViews = [];
            let index = 0;
            console.log(dataType)
            for (var i = 0; i < dataType['length']; i++) {
                let subDataViews = {}
                for (var j = 0; j < dataType['subDataTypes'].length; j++) {
                    let subDataView = getObject(
                        {
                            ...data,
                            'title': dataType['subDataTypes'][j]['title'],
                            'dataTypeId': dataType['subDataTypes'][j]['subDataTypeId'],
                            'index': (data.index ? data.index : 0) + index
                        }, dataTypes
                    );
                    subDataViews[dataType['subDataTypes'][j]['title']] = subDataView[0]
                    index = index + subDataView[1]
                }
                elemViews.push(subDataViews)
            }
            return [{ data: elemViews, dataTypeId: (data.dataTypeId ? data.dataTypeId : 0), index: (data.index ? data.index : 0), length: index }, index]
        } else {
            return [{ data: data.values[(data.index ? data.index : 0)], index: (data.index ? data.index : 0), length: 1, dataTypeId: (data.dataTypeId ? data.dataTypeId : 0) }, 1];
        }
    }
    else return [null, 0]
}

export let blankValues = (dataTypeId, dataTypes) => {
    let dataType = dataTypes.find(dataType => dataType.id == dataTypeId)
    if (dataType.base == DATATYPE_INT) return [0]
    else if (dataType.base == DATATYPE_FLOAT) return [0.0]
    else if (dataType.base == DATATYPE_TEXT) return [""]
    else if (dataType.base == DATATYPE_STRUCTURE) {
        let values = []
        for (var i = 0; i < dataType['length']; i++) {
            for (var j = 0; j < dataType['subDataTypes'].length; j++) {
                values.push(...blankValues(dataType['subDataTypes'][j]['subDataTypeId'], dataTypes))
            }
        }
        return values
    }
    else return []
}

function DataEdit(props) {
    let [selected, setSelected] = useState(props.selected);
    let [showDropDown, setShowDropDown] = useState(false);
    return <View style={props.selected ? styles.editor : [styles.editor, { flex: 1 }]}>
        {
            props.selected
                ?
                null
                :
                <Drawer.Section title="Data">
                    <Drawer.Item icon="plus" key={0} active={selected && 0 == selected.id} label="New" onPress={() => setSelected({ title: "", id: 0, dataTypeId: 0 })} />
                    {
                        props.data.map(
                            data => <Drawer.Item
                                icon="database"
                                key={data.id}
                                active={selected && data.id == selected.id}
                                label={<View>
                                    <Text>{data.title}</Text>
                                    <Caption>{new Date(parseFloat(data.created) * 1000).toString()}</Caption>
                                </View>}
                                onPress={
                                    () => {
                                        console.log("onSelect:")
                                        console.log(getObject(data, props.dataTypes))
                                        setSelected(data)
                                    }
                                } />
                        )
                    }
                </Drawer.Section>
        }
        {
            selected
                ?
                <View style={{ flex: 1 }}>
                    {
                        selected.id == 0
                            ?
                            <View style={{ flexDirection: 'row' }}>
                                <TextInput
                                    label={"Title"}
                                    style={{ flex: 1 }}
                                    value={selected.title}
                                    onChangeText={value => setSelected(data => ({
                                        ...data,
                                        title: value
                                    }))}
                                />
                                <DropDown style={{ flex: 1 }}
                                    label="DataType"
                                    value={selected.dataTypeId}
                                    list={props.dataTypes.map(dataType => {
                                        return { label: dataType.title, value: dataType.id }
                                    })}
                                    setValue={value => {
                                        let blanks = blankValues(value, props.dataTypes)
                                        console.dir(blanks)
                                        setSelected(data => ({
                                            ...data,
                                            dataTypeId: value,
                                            values: blanks
                                        }))
                                    }}
                                    visible={showDropDown}
                                    showDropDown={() => setShowDropDown(true)}
                                    onDismiss={() => setShowDropDown(false)}
                                />
                                {
                                    props.postData
                                        ?
                                        <Button icon="check" onPress={() => {
                                            props.postData(selected, (data) => setSelected(data))
                                        }}>Save</Button>
                                        :
                                        null
                                }
                            </View>
                            :
                            props.deleteData
                                ?
                                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                                    <Button icon="close" onPress={() => {
                                        props.deleteData(selected.id)
                                        setSelected(null)
                                    }}>Delete</Button>
                                </View>
                                :
                                null
                    }
                    <List.Section>
                        {
                            selected.values && selected.dataTypeId
                                ?
                                <DataView i={0} title={selected.title} data={getObject(selected, props.dataTypes)[0]} onChange={selected.id == 0
                                    ?
                                    (index, value) =>
                                        setSelected(data => {
                                            data['values'][index] = value
                                            console.log(data);
                                            return data
                                        })
                                    :
                                    null} />
                                : null
                        }
                    </List.Section>
                </View>
                :
                <View style={styles.notSelectedMessage}>
                    <Headline style={{ color: 'gray' }}>Please select a Data from the left menu, or create a new one!</Headline>
                </View>
        }
    </View>;
}

const styles = StyleSheet.create({
    editor: {
        flexDirection: 'row',
        margin: 5,
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

export default withTheme(DataEdit);
