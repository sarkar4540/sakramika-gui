import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Surface, Text, Appbar, IconButton, Colors, Headline, TextInput, Button } from 'react-native-paper';
import Svg, { Line, Path, G, Defs, Marker } from 'react-native-svg';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      processes: [{
        name: "start",
        style: {
          top: 20,
          left: 450
        }
      },
      {
        name: "end",
        style: {
          top: 700,
          left: 450
        }
      }],
      controlFlows: [],
      currentIn: null,
      currentOut: null,
      showAddProcess: false,
      addProcess: null
    }
    this.setState.bind(this);
  }
  
  render() {
    return (
      <View style={styles.outContainer}>
        <Svg style={styles.svgContainer}>
          {this.state.controlFlows.map((cf, i) => <G>
            <Line x1={cf.out.x} x2={cf.in.x} y1={cf.out.y} y2={cf.in.y} stroke="black" strokeWidth={2} markerEnd="url(#arrow)" />
          </G>)}
        </Svg>
        <Appbar style={styles.topbar}>
          <Appbar.Header><Text style={{ fontSize: 20, color: "white" }}>Workflow Control</Text></Appbar.Header>
        </Appbar>
        <Surface style={{ padding: 5, flexDirection: 'row' }}>
          <IconButton
            icon="shape-rectangle-plus"
            color={Colors.red500}
            size={20}
            onPress={() => this.setState({ showAddProcess: true, addProcess: { name: '', url: '' } })}
          />
          <IconButton
            icon="content-save"
            color={Colors.red500}
            size={20}
            onPress={async () => {
              const fileName = "workflow";
              const json = JSON.stringify(this.state);
              const blob = new Blob([json],{type:'application/json'});
              const href = await URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = href;
              link.download = fileName + ".json";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          />
          <IconButton
            icon="play"
            color={Colors.red500}
            size={20}
            onPress={() => console.log('Pressed')}
          />
        </Surface>
        <Pressable onPress={(evt)=>{
            console.log(evt);
          if(this.state.addProcess&&!this.state.showAddProcess){
            let processes=this.state.processes;
            processes.push({name:this.state.addProcess.name,style:{top:evt.nativeEvent.layerY,left:evt.nativeEvent.layerX}});
            this.setState({processes,addProcess:null});
          } else{
            this.setState({currentIn:null,currentOut:null});
          }
        }} style={styles.container}>

          {this.state.processes.map((process, i) => <Surface key={i} style={{ padding: 5, alignItems: "center", position: 'absolute', ...process.style }}>
            {process.name!="start"?
            <Pressable onPress={(evt) => {
              if (this.state.currentOut == null) {
                this.setState({
                  currentIn: { i, x: evt.nativeEvent.x, y: evt.nativeEvent.y }
                });
              }
              else {
                let contains = false, elem = { in: { i, x: evt.nativeEvent.x, y: evt.nativeEvent.y }, out: this.state.currentOut };
                let controlFlows = [];
                this.state.controlFlows.forEach(controlFlow => {
                  if (controlFlow.in.i == elem.in.i && controlFlow.out.i == elem.out.i) {
                    contains = true;
                  }
                  else {
                    controlFlows.push(controlFlow);
                  }
                })
                if (!contains) controlFlows.push(elem);
                this.setState({ controlFlows: controlFlows, currentIn: null, currentOut: null });
              }
            }} style={{ width: 10, height: 10, borderColor: "black", borderStyle: "solid", borderWidth: 1, borderRadius: "50%", ...this.state.currentIn != null && this.state.currentIn.i == i ? { background: "red" } : {} }}
              {...this.state.currentIn != null ? { disabled: "disabled" } : {}}
            ></Pressable>:null}
            <Text>{process.name}</Text>
            {process.name!="end"?
            <Pressable onPress={(evt) => {
              if (this.state.currentIn == null) {
                this.setState({
                  currentOut: { i, x: evt.nativeEvent.x, y: evt.nativeEvent.y }
                });
              }
              else {
                let contains = false, elem = { in: this.state.currentIn, out: { i, x: evt.nativeEvent.x, y: evt.nativeEvent.y } };
                let controlFlows = [];
                this.state.controlFlows.forEach(controlFlow => {
                  if (controlFlow.in.i == elem.in.i && controlFlow.out.i == elem.out.i) {
                    contains = true;
                  }
                  else {
                    controlFlows.push(controlFlow);
                  }
                })
                if (!contains) controlFlows.push(elem);
                this.setState({ controlFlows: controlFlows, currentIn: null, currentOut: null });
              }
            }} style={{ width: 10, height: 10, borderColor: "black", borderStyle: "solid", borderWidth: 1, borderRadius: "50%", ...this.state.currentOut != null && this.state.currentOut.i == i ? { background: "red" } : {} }}
              {...this.state.currentOut != null ? { disabled: "disabled" } : {}}
            ></Pressable>:null}
          </Surface>)}
        </Pressable>
        {this.state.showAddProcess ?
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
            <Surface style={{ padding: 10 }}>
              <Headline style={{ color: "black" }}>Add Process</Headline>
              <TextInput
                label="Name"
                value={this.state.addProcess.name}
                onChangeText={text => this.setState({ addProcess: { ...this.state.addProcess, name: text } })}
              />
              <TextInput
                label="URL"
                value={this.state.addProcess.url}
                onChangeText={text => this.setState({ addProcess: { ...this.state.addProcess, url: text } })}
              />
              <Button mode="contained" onPress={() => this.setState({ showAddProcess: false })}>
                Add
              </Button>
              <Button mode="outlined" onPress={() => this.setState({ addProcess: null, showAddProcess: false })}>
                Cancel
              </Button>
            </Surface>
          </View> : null}
        <StatusBar style="auto" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  svgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  },
  outContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  topbar: {
    top: 0,
    left: 0,
    right: 0
  }
});

export default App;