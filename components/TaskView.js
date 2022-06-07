import * as React from "react"
import { View } from "react-native";
import { TouchableOpacity } from "react-native";
import { IconButton } from "react-native-paper";
import Svg, { Path } from "react-native-svg"
import { Circle } from "react-native-svg";
import { Text } from "react-native-svg"

const DEFAULT = "M40 10H190L160 90H10z",
    DECISION = "M100 10L190 50L100 90L10 50z",
    TERMINAL = "M50 10H150A1 1 0 0 1 150 90H50A1 1 0 0 1 50 10z",
    TASK_DECISION = 6,
    TASK_TERMINAL = 10;

const TaskView = (props) => (
    <View style={[props.selected?{backgroundColor:"#ccc"}:{},props.style]}>
        <Svg width={200} height={100}>
            <Path
                style={{
                    stroke: "#000",
                    fill: "#fff"
                }}
                d={
                    props.type == TASK_DECISION
                        ?
                        DECISION
                        :
                        props.type == TASK_TERMINAL
                            ?
                            TERMINAL
                            :
                            DEFAULT
                }
            />
            <Text x={100} y={55} textAnchor="middle">
                {props.title.length > 15 ? props.title.substring(0, 15) + "..." : props.title}
            </Text>

        </Svg>
        {
            props.selectEdgeEnd &&!(props.type==TASK_TERMINAL&&props.title==="start")
                ?
                <TouchableOpacity onPress={() => props.selectEdgeEnd([props.id])} style={{ position: 'absolute', top: 0, left: 90 }}>
                    <Svg width={20} height={20}>
                        <Circle cx={10} cy={10} r={9} stroke='#000' />
                    </Svg>
                </TouchableOpacity>
                :
                null
        }
        {
            props.selectEdgeStart&&!(props.type==TASK_TERMINAL&&props.title==="end")
                ?
                props.type==TASK_DECISION
                ?
                [
                <TouchableOpacity onPress={() => props.selectEdgeStart([props.id,0])} style={{ position: 'absolute', top: 40, left: 180 }}>
                    <Svg width={20} height={20}>
                        <Circle cx={10} cy={10} r={9} stroke='#000' />
                        <Text x={5} y={15} stroke="#fff">N</Text>
                    </Svg>
                </TouchableOpacity>,
                <TouchableOpacity onPress={() => props.selectEdgeStart([props.id,1])} style={{ position: 'absolute', top: 80, left: 90 }}>
                    <Svg width={20} height={20}>
                        <Circle cx={10} cy={10} r={9} stroke='#000' />
                        <Text x={5} y={15} stroke="#fff">Y</Text>
                    </Svg>
                </TouchableOpacity>
                ]
                :
                <TouchableOpacity onPress={() => props.selectEdgeStart([props.id])} style={{ position: 'absolute', top: 80, left: 90 }}>
                    <Svg width={20} height={20}>
                        <Circle cx={10} cy={10} r={9} stroke='#000' />
                    </Svg>
                </TouchableOpacity>
                :
                null
        }
        {
            props.type != TASK_TERMINAL && props.deleteTaskInstance
                ?
                    <IconButton style={{ position: 'absolute', top: 5, right: 10 }} icon={"close-circle"} color={"red"} size={16} onPress={()=>props.deleteTaskInstance(props.id)}/>
                :
                null
        }
    </View>
)

export default TaskView