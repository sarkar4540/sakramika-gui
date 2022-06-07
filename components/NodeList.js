import { Avatar, Button, Card, FAB, Headline, IconButton, Surface, TextInput, withTheme } from "react-native-paper";
import React, { useState } from 'react';
import { StyleSheet, View } from "react-native";

function NodeList(props) {
    let [addNode, setAddNode] = useState(false);
    let [editNode, setEditNode] = useState(-1);
    let [nodeTitle, setNodeTitle] = useState("");
    let [nodeIpAddr, setNodeIpAddr] = useState("");

    return <View style={styles.nodelist}>
        <Headline style={{color:props.theme.colors.primary}}>Your Nodes</Headline>
        <View style={styles.nodes}>
            {
                props.nodes ? props.nodes.map(node => editNode == node.id ? <Card key={node.id} style={styles.node}>
                    <Card.Title style={styles.nodetitle} left={props => <Avatar.Icon icon="chip" {...props} />} title="Edit Node" />
                    <TextInput label="Node Title" value={nodeTitle} onChangeText={text => setNodeTitle(text)} />
                    <Card.Actions>
                        <Button icon="check" color="green" onPress={() => { props.onEditNode(node.id, nodeTitle); setEditNode(-1); }}>Save</Button>
                    </Card.Actions>
                    <IconButton color="gray" size={16} onPress={() => setEditNode(-1)} icon="close-circle" style={styles.nodeRemoveButton} />
                </Card> : <Card key={node.id} style={styles.node}>
                    <Card.Title style={styles.nodetitle} left={props => <Avatar.Icon style={ {...node.id==0?{backgroundColor:"green"}:{}}} icon="chip" {...props} />} title={node.title} />
                    <Card.Actions style={styles.services}>
                        {
                            node.services ? node.services.map(service => <Button icon="play-network" onPress={() => props.onStartService(node.id, service.id)} key={service.id}>
                                {service.title}
                            </Button>) : null
                        }
                    </Card.Actions>
                    <View style={styles.nodeRemoveButton}>
                        {props.onEditNode ? <IconButton size={18} color="gray" onPress={() => { setNodeTitle(node.title); setEditNode(node.id) }} icon="pencil-circle" /> : null}
                        {props.onRemoveNode && node.id > 0 ? <IconButton color="red" size={18} onPress={() => props.onRemoveNode(node.id)} icon="close-circle" /> : null}
                    </View>
                </Card>) : null
            }
            {props.onAddNode ? addNode ? <Card key={0} style={styles.node}>
                <Card.Title style={styles.nodetitle} titleStyle={{ flexWrap: 'wrap', flexDirection: 'row' }} left={props => <Avatar.Icon icon="chip" {...props} />} title="Add Node" />
                <TextInput label="Node Title" value={nodeTitle} onChangeText={text => setNodeTitle(text)} />
                <TextInput label="IP/Domain Address:Port" value={nodeIpAddr} onChangeText={text => setNodeIpAddr(text)} />
                <Card.Actions>
                    <Button icon="check" color="green" onPress={() => { props.onAddNode(nodeIpAddr, nodeTitle); setAddNode(false); }}>Add</Button>
                </Card.Actions>
                <IconButton color="gray" size={16} onPress={() => setAddNode(false)} icon="close-circle" style={styles.nodeRemoveButton} />
            </Card> : <FAB style={styles.addNode} icon="plus" onPress={() => { setNodeIpAddr(""); setNodeTitle(""); setAddNode(true) }} /> : null}
        </View>
    </View>;
}

const styles = StyleSheet.create({
    node: {
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        margin: 8,
        maxWidth: '100%'
    },
    nodes: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
    nodetitle: {
        marginTop: 8,
        marginRight: 16
    },
    services: {
        flex: 1,
        flexWrap: 'wrap'
    },
    nodelist: {
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        margin:8
    },
    nodeRemoveButton: {
        flexDirection: 'row',
        position: 'absolute',
        top: -5,
        right: -5
    },
    addNode:{
        margin:8
    }
});

export default withTheme(NodeList);
