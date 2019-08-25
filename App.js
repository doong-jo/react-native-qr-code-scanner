import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Dimensions,
} from 'react-native';

import {
    RNCamera
} from 'react-native-camera';

import Dialog, { 
    DialogTitle, 
    DialogContent,
    DialogButton,
    DialogFooter
} from 'react-native-popup-dialog';

const 
    flashModeOrder = {
        off: 'torch',
        torch: 'off',
    },
    ATT_WAITING = "ATT_WAITING",
    ATT_SUCCESS = "ATT_SUCCESS",
    ATT_FAIL = "ATT_FAIL",

    ATT_TEXT = {
        ATT_WAITING: (<Text>서버에 요청중입니다...</Text>),
        ATT_SUCCESS: (<Text>출석 체크가 완료되었습니다.</Text>),
        ATT_FAIL: (<Text>서버 요청을 실패했습니다. 다시 시도해주세요.</Text>)
    };
    

export default class CameraScreen extends React.Component {
    state = {
        flash: 'off',
        zoom: 0,
        autoFocus: 'on',
        autoFocusPoint: {
            normalized: {
                x: 0.5,
                y: 0.5
            },
            drawRectPosition: {
                x: Dimensions.get('window').width * 0.5 - 32,
                y: Dimensions.get('window').height * 0.5 - 32,
            },
        },
        depth: 0,
        type: 'back',
        whiteBalance: 'auto',
        ratio: '16:9',
        canDetectBarcode: true,
        barcodes: [],
        dialogVisible: false,
        dialogVisibleDone : true,
        attendState: ATT_WAITING,
    };

    touchToFocus(event) {
        const {
            pageX,
            pageY
        } = event.nativeEvent;
        const screenWidth = Dimensions.get('window').width;
        const screenHeight = Dimensions.get('window').height;
        const isPortrait = screenHeight > screenWidth;

        let x = pageX / screenWidth;
        let y = pageY / screenHeight;
        
        if (isPortrait) {
            x = pageY / screenHeight;
            y = -(pageX / screenWidth) + 1;
        }

        this.setState({
            autoFocusPoint: {
                normalized: {
                    x,
                    y
                },
                drawRectPosition: {
                    x: pageX,
                    y: pageY
                },
            },
        });
    }

    toggleDialog() {
        this.setState({
            dialogVisible: false,
        });

        // after dialog hide completly
        setTimeout(() => {this.setState({dialogVisibleDone: true});}, 100);
    }

    toggleFlash() {
        this.setState({
            flash: flashModeOrder[this.state.flash],
        });
    }

    zoomOut() {
        this.setState({
            zoom: this.state.zoom - 0.1 < 0 ? 0 : this.state.zoom - 0.1,
        });
    }

    zoomIn() {
        this.setState({
            zoom: this.state.zoom + 0.1 > 1 ? 1 : this.state.zoom + 0.1,
        });
    }

    barcodeRecognized = ({barcodes}) => (
        this.state.dialogVisibleDone ? 
            this.setState({ barcodes, dialogVisible : true, dialogVisibleDone: false }) : undefined
    );

    renderBarcodes = () => ( 
        <View 
            style = { styles.facesContainer }
            pointerEvents = "none" >
                { this.state.barcodes.map(this.renderBarcode) }
        </View>
    );

    renderBarcode = ({
        bounds,
        data,
        type
    }) => ( 
        <React.Fragment 
            key = { data + bounds.origin.x } >
            <View 
                style = { [
                    styles.text,
                    {
                        ...bounds.size,
                        left: bounds.origin.x,
                        top: bounds.origin.y,
                    },
                ] } >
                <Text 
                    style = { [styles.textBlock] } > 
                    { `${data} ${type}` } 
                </Text> 
            </View> 
        </React.Fragment>
    );

    renderAttendContent = () => {
        return ATT_TEXT[this.state.attendState];
    }

    requestAttend = () => {
        // TODO : api required. (not yet prepare server)
        // this.state.barcodes[0] <- This is Barcode Object (node_moduels/react-native-camera/types/index.d.ts > Barcode interface)

        /* 
        ...
        request logic...
        ...

        const nextAttState = "recv response state from server"
        this.setState({
             attendState: nextAttState
        }); 
        */
    }

    dialogShown = () => {
        // requestAttend();
    }

    renderCamera() {
        const {
            canDetectBarcode
        } = this.state;

        const drawFocusRingPosition = {
            top: this.state.autoFocusPoint.drawRectPosition.y - 32,
            left: this.state.autoFocusPoint.drawRectPosition.x - 32,
        };
        return ( 
            <RNCamera ref={
                    ref => { this.camera = ref; }
                }
                style={ {
                        flex: 1,
                        justifyContent: 'space-between',
                    } }
                type = { this.state.type }
                flashMode = { this.state.flash }
                autoFocus = { this.state.autoFocus }
                autoFocusPointOfInterest = { this.state.autoFocusPoint.normalized }
                zoom = { this.state.zoom }
                whiteBalance = { this.state.whiteBalance }
                ratio = { this.state.ratio }
                focusDepth = { this.state.depth }
                androidCameraPermissionOptions = { {
                    title: 'Permission to use camera',
                    message: 'We need your permission to use your camera',
                    buttonPositive: 'Ok',
                    buttonNegative: 'Cancel',
                } }
                onGoogleVisionBarcodesDetected = { this.barcodeRecognized } >
                <View style = { StyleSheet.absoluteFill } >
                    <View style = { [styles.autoFocusBox, drawFocusRingPosition] }
                    /> 
                    <TouchableWithoutFeedback onPress = { this.touchToFocus.bind(this) } >
                        <View style = { { flex: 1 } } /> 
                    </TouchableWithoutFeedback> 
                </View> 
                <View style = { { bottom: 0 } } > 
                    {
                        this.state.zoom !== 0 && ( 
                            <Text style = { [styles.flipText, styles.zoomText] } >Zoom: { this.state.zoom }</Text>
                        )
                } 
                    <View style = { {
                            height: 56,
                            backgroundColor: 'transparent',
                            flexDirection: 'row',
                            alignSelf: 'flex-end',
                        } } >
                        <TouchableOpacity style = { [
                            styles.flipButton, 
                            {
                                flex: 0.1,
                                alignSelf: 'flex-end'
                            }] }
                            onPress = { this.toggleFlash.bind(this) } >
                            <Text style = { styles.flipText } >F</Text> 
                        </TouchableOpacity> 
                        <TouchableOpacity style = { [
                            styles.flipButton, 
                            {
                                flex: 0.1,
                                alignSelf: 'flex-end'
                            }] }
                            onPress = { this.zoomIn.bind(this) } >
                            <Text style = { styles.flipText } >+</Text> 
                        </TouchableOpacity> 
                        <TouchableOpacity style = { [
                            styles.flipButton, 
                            {
                                flex: 0.1,
                                alignSelf: 'flex-end'
                            }] }
                            onPress = { this.zoomOut.bind(this) } >
                            <Text style = { styles.flipText } >-</Text> 
                        </TouchableOpacity> 
                    </View> 
                </View>

                { !!canDetectBarcode && this.renderBarcodes() }

                <View style={StyleSheet.absoluteFill}>
                    <Dialog
                        visible={ this.state.dialogVisible }
                        onShow={ this.dialogShown.bind(this) }
                        dialogTitle={<DialogTitle title="출석 체크" />}
                        footer={
                            <DialogFooter>
                                <DialogButton
                                    text="계속하기"
                                    onPress={ this.toggleDialog.bind(this) }
                                />
                            </DialogFooter>
                          }
                    >
                        <DialogContent>
                            { this.renderAttendContent.bind(this)() }
                        </DialogContent>
                    </Dialog>
                </View>
            </RNCamera>
        );
    }

    render() {
        return <View style = { styles.container } >
            { this.renderCamera() }
        </View>;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 10,
        backgroundColor: '#000',
    },
    flipButton: {
        flex: 0.3,
        height: 40,
        marginHorizontal: 2,
        marginBottom: 10,
        marginTop: 10,
        borderRadius: 8,
        borderColor: 'white',
        borderWidth: 1,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    autoFocusBox: {
        position: 'absolute',
        height: 64,
        width: 64,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'white',
        opacity: 0.4,
    },
    facesContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        left: 0,
        top: 0,
    },
    flipText: {
        color: 'white',
        fontSize: 15,
    },
    zoomText: {
        position: 'absolute',
        bottom: 70,
        zIndex: 2,
        left: 2,
    },
    text: {
        padding: 10,
        borderWidth: 2,
        borderRadius: 2,
        position: 'absolute',
        borderColor: '#F00',
        justifyContent: 'center',
    },
    textBlock: {
        color: '#F00',
        position: 'absolute',
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
});