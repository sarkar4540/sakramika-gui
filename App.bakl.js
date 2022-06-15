import React, { useState } from "react";
import { View } from "react-native";
import { Button, Caption, Text, TextInput } from "react-native-paper";
let App = (props) => {
    let [fname,setFName]=useState("");
    let [lname,setLName]=useState("");
    let [fnameError,setFNameError]=useState("");
    let [lnameError,setLNameError]=useState("");
    return <View>
        <TextInput label={"First Name"} value={fname} error={fnameError} onChangeText={(value)=>setFName(value)}/>
        {fnameError?<Caption style={{color:'red'}}>{fnameError}</Caption>:null}
        <TextInput label={"Last Name"} value={lname} error={lnameError} onChangeText={(value)=>setLName(value)}/>
        {lnameError?<Caption style={{color:'red'}}>{lnameError}</Caption>:null}
        <Button
            onPress={() => {
                setFNameError(fname.length>=3?false:"First Name should have atleast 3 characters.")
                setLNameError(fname.length>=1?false:"Last Name should have atleast 1 character.")
            }}
        >Submit</Button>
    </View>
};
export default App