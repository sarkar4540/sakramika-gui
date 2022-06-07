import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {  StyleSheet } from 'react-native';
import { Appbar,  DarkTheme, DefaultTheme, IconButton, Provider, withTheme } from 'react-native-paper';
import Editor from './Editor';
import Home from './Home';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            theme: DefaultTheme,
        }
        this.setState.bind(this);
    }

    render() {
        return (
            <Provider theme={this.state.theme}>
                <Appbar.Header style={styles.appbar}>
                    <MaterialCommunityIcons onPress={()=>window.location.assign('/')} style={styles.logo} name="hexagon-multiple-outline" size={48} />
                    <Appbar.Content title="ṣakrāmika" subtitle="Indian Institute of Technology, Tirupati" titleStyle={styles.uncorp} />
                    <IconButton onPress={() => this.setState({ theme: this.state.theme === DefaultTheme ? DarkTheme : DefaultTheme })} icon="theme-light-dark" />
                </Appbar.Header>
                {(() => {
                    switch (window.location.pathname) {
                        case '/editor':
                            return <Editor workflowId={window.location.hash.substring(1)} />
                        case '/':
                        default:
                            return <Home />
                    }
                })()}

            </Provider>
        );
    }
}

const styles = StyleSheet.create({
    logo: {
        borderRadius: 2,
        color: 'white'
    },
    appbar: {
        padding: 8
    },
    uncorp: {
    },
});

export default withTheme(App);