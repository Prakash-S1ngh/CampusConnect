import { useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Peer from "peerjs";
import { 
    Mic, 
    MicOff, 
    Video, 
    VideoOff, 
    Phone, 
    PhoneOff,
    Monitor,
    MonitorOff,
    Volume2,
    VolumeX,
    MessageSquare,
    X,
    Settings,
    Maximize,
    Minimize,
    RotateCcw,
    Camera,
    CameraOff,
    Users,
    Shield,
    Wifi,
    WifiOff
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import React from "react";
import { url } from "../../lib/PostUrl";
import { StudentContext } from "../Student/StudentContextProvider";
import { toast } from "react-hot-toast";

const VideoCall = () => {
    const { socket, user } = useContext(StudentContext);
    const navigate = useNavigate();
    const [micOn, setMicOn] = useState(true);
    const [videoOn, setVideoOn] = useState(true);
    const [screenSharing, setScreenSharing] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [remoteStream, setRemoteStream] = useState(null);
    const [localStream, setLocalStream] = useState(null);
    const [screenStream, setScreenStream] = useState(null);
    const [callDuration, setCallDuration] = useState(0);
    const [callQuality, setCallQuality] = useState('good');
    const [isConnecting, setIsConnecting] = useState(true);
    const [participantName, setParticipantName] = useState('Unknown');
    const [showSettings, setShowSettings] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);

    const location = useLocation();
    const { sender, receiver } = location.state || {};

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const screenVideoRef = useRef(null);
    const peerInstance = useRef(null);
    const callInstance = useRef(null);
    const screenCallInstance = useRef(null);
    const durationInterval = useRef(null);
    const audioContext = useRef(null);
    const analyser = useRef(null);
    const dataArray = useRef(null);

    useEffect(() => {
        const getMedia = async () => {
            try {
                setIsConnecting(true);
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        facingMode: 'user'
                    }, 
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    }
                });
                setLocalStream(stream);

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                // Initialize audio level monitoring
                initializeAudioLevel(stream);

                const peer = new Peer(undefined, {
                    config: {
                        iceServers: [
                            { urls: 'stun:stun.l.google.com:19302' },
                            { urls: 'stun:stun1.l.google.com:19302' },
                            { urls: 'stun:stun2.l.google.com:19302' }
                        ]
                    },
                    debug: 2
                });

                peer.on("open", (id) => {
                    socket.emit("joinRoom", { sender, receiver, peerId: id });
                    toast.success("Call connected!");
                });

                peer.on("call", (call) => {
                    call.answer(stream);
                    call.on("stream", (remoteStream) => {
                        setRemoteStream(remoteStream);
                        if (remoteVideoRef.current) {
                            remoteVideoRef.current.srcObject = remoteStream;
                        }
                    });
                    callInstance.current = call;
                    setIsConnecting(false);
                });

                peer.on("error", (error) => {
                    console.error("Peer error:", error);
                    toast.error("Connection error occurred");
                });

                socket.on("remote-peer-id", (remotePeerId) => {
                    const call = peer.call(remotePeerId, stream);
                    call.on("stream", (remoteStream) => {
                        setRemoteStream(remoteStream);
                        if (remoteVideoRef.current) {
                            remoteVideoRef.current.srcObject = remoteStream;
                        }
                    });
                    callInstance.current = call;
                    setIsConnecting(false);
                });

                peerInstance.current = peer;
            } catch (error) {
                console.error("Error accessing media devices:", error);
                toast.error("Failed to access camera/microphone");
                navigate(-1);
            }
        };

        getMedia();

        socket.on("call-ended", () => {
            endCall();
        });

        socket.on("participant-info", (info) => {
            setParticipantName(info.name || 'Unknown');
        });

        // Start call duration timer
        durationInterval.current = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);

        return () => {
            socket.off("call-ended");
            socket.off("participant-info");
            if (durationInterval.current) {
                clearInterval(durationInterval.current);
            }
        };
    }, []);

    const initializeAudioLevel = (stream) => {
        try {
            audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.current.createMediaStreamSource(stream);
            analyser.current = audioContext.current.createAnalyser();
            analyser.current.fftSize = 256;
            source.connect(analyser.current);
            
            dataArray.current = new Uint8Array(analyser.current.frequencyBinCount);
            
            const updateAudioLevel = () => {
                if (analyser.current && dataArray.current) {
                    analyser.current.getByteFrequencyData(dataArray.current);
                    const average = dataArray.current.reduce((a, b) => a + b) / dataArray.current.length;
                    setAudioLevel(average);
                }
                requestAnimationFrame(updateAudioLevel);
            };
            updateAudioLevel();
        } catch (error) {
            console.error("Error initializing audio level:", error);
        }
    };

    const toggleMic = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !micOn;
                setMicOn(!micOn);
                toast(micOn ? "Microphone muted" : "Microphone unmuted");
            }
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoOn;
                setVideoOn(!videoOn);
                toast(videoOn ? "Camera turned off" : "Camera turned on");
            }
        }
    };

    const toggleScreenSharing = async () => {
        try {
            if (!screenSharing) {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: false
                });
                
                setScreenStream(screenStream);
                setScreenSharing(true);
                
                if (screenVideoRef.current) {
                    screenVideoRef.current.srcObject = screenStream;
                }

                // Replace video track in the call
                if (callInstance.current) {
                    const videoTrack = screenStream.getVideoTracks()[0];
                    const sender = peerInstance.current.peerConnections[callInstance.current.peer].getSenders()
                        .find(s => s.track?.kind === 'video');
                    if (sender) {
                        sender.replaceTrack(videoTrack);
                    }
                }

                toast.success("Screen sharing started");
            } else {
                if (screenStream) {
                    screenStream.getTracks().forEach(track => track.stop());
                    setScreenStream(null);
                }
                
                // Restore camera video track
                if (callInstance.current && localStream) {
                    const videoTrack = localStream.getVideoTracks()[0];
                    const sender = peerInstance.current.peerConnections[callInstance.current.peer].getSenders()
                        .find(s => s.track?.kind === 'video');
                    if (sender && videoTrack) {
                        sender.replaceTrack(videoTrack);
                    }
                }
                
                setScreenSharing(false);
                toast.success("Screen sharing stopped");
            }
        } catch (error) {
            console.error("Error toggling screen sharing:", error);
            toast.error("Failed to toggle screen sharing");
        }
    };

    const toggleRecording = () => {
        setIsRecording(!isRecording);
        toast(isRecording ? "Recording stopped" : "Recording started");
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const endCall = () => {
        socket.emit("end-call", { sender, receiver });

        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }

        if (screenStream) {
            screenStream.getTracks().forEach(track => track.stop());
        }

        if (audioContext.current) {
            audioContext.current.close();
        }

        if (localVideoRef.current) localVideoRef.current.srcObject = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        if (screenVideoRef.current) screenVideoRef.current.srcObject = null;

        if (callInstance.current) {
            callInstance.current.close();
        }

        if (screenCallInstance.current) {
            screenCallInstance.current.close();
        }

        if (peerInstance.current) {
            peerInstance.current.destroy();
        }

        if (durationInterval.current) {
            clearInterval(durationInterval.current);
        }

        toast.success("Call ended");
        navigate(-1);
    };

    const formatDuration = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getQualityIndicator = () => {
        switch (callQuality) {
            case 'excellent':
                return <Wifi className="text-green-500" size={16} />;
            case 'good':
                return <Wifi className="text-yellow-500" size={16} />;
            case 'poor':
                return <WifiOff className="text-red-500" size={16} />;
            default:
                return <Wifi className="text-gray-500" size={16} />;
        }
    };

    return (
        <div className="relative h-screen bg-black text-white overflow-hidden">
            {/* Main Video Area */}
            <div className="relative w-full h-full">
                {/* Remote Video */}
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                />
                
                {/* Screen Share Overlay */}
                {screenSharing && (
                    <div className="absolute top-4 left-4 w-80 h-48 bg-black rounded-lg overflow-hidden border-2 border-white shadow-lg">
                        <video
                            ref={screenVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-contain"
                        />
                        <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded text-xs">
                            Screen Share
                        </div>
                    </div>
                )}

                {/* Local Video */}
                <div className="absolute bottom-4 right-4 w-48 h-36 md:w-64 md:h-48 bg-black rounded-lg overflow-hidden border-2 border-white shadow-lg">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    />
                    {!videoOn && (
                        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                            <CameraOff size={32} className="text-gray-400" />
                        </div>
                    )}
                    {!micOn && (
                        <div className="absolute top-2 left-2 bg-red-500 rounded-full p-1">
                            <MicOff size={12} />
                        </div>
                    )}
                </div>

                {/* Connection Status */}
                {isConnecting && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 px-4 py-2 rounded-full">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-sm">Connecting...</span>
                        </div>
                    </div>
                )}

                {/* Call Info */}
                <div className="absolute top-4 left-4 bg-black/70 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <span className="font-medium">{participantName}</span>
                        {getQualityIndicator()}
                    </div>
                    <div className="text-sm text-gray-300">{formatDuration(callDuration)}</div>
                </div>

                {/* Audio Level Indicator */}
                <div className="absolute top-4 right-4 bg-black/70 px-3 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-2 bg-gray-600 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-green-500 transition-all duration-100"
                                style={{ width: `${(audioLevel / 255) * 100}%` }}
                            ></div>
                        </div>
                        <Volume2 size={16} />
                    </div>
                </div>
            </div>

            {/* Control Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <div className="flex justify-center items-center space-x-4">
                    {/* Microphone */}
                    <button 
                        onClick={toggleMic} 
                        className={`p-4 rounded-full transition-all duration-200 ${
                            micOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
                        }`}
                    >
                        {micOn ? <Mic size={24} /> : <MicOff size={24} />}
                    </button>

                    {/* Camera */}
                    <button 
                        onClick={toggleVideo} 
                        className={`p-4 rounded-full transition-all duration-200 ${
                            videoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
                        }`}
                    >
                        {videoOn ? <Video size={24} /> : <VideoOff size={24} />}
                    </button>

                    {/* Screen Share */}
                    <button 
                        onClick={toggleScreenSharing} 
                        className={`p-4 rounded-full transition-all duration-200 ${
                            screenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                    >
                        {screenSharing ? <MonitorOff size={24} /> : <Monitor size={24} />}
                    </button>

                    {/* End Call */}
                    <button 
                        onClick={endCall} 
                        className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-200"
                    >
                        <PhoneOff size={24} />
                    </button>

                    {/* Chat */}
                    <button 
                        onClick={() => setShowChat(!showChat)} 
                        className={`p-4 rounded-full transition-all duration-200 ${
                            showChat ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                    >
                        <MessageSquare size={24} />
                    </button>

                    {/* Fullscreen */}
                    <button 
                        onClick={toggleFullscreen} 
                        className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-all duration-200"
                    >
                        {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
                    </button>

                    {/* Settings */}
                    <button 
                        onClick={() => setShowSettings(!showSettings)} 
                        className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-all duration-200"
                    >
                        <Settings size={24} />
                    </button>
                </div>
            </div>

            {/* Chat Overlay */}
            {showChat && (
                <div className="absolute top-4 right-4 w-80 h-96 bg-white rounded-lg shadow-lg flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="font-semibold text-gray-800">Chat</h3>
                        <button 
                            onClick={() => setShowChat(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto">
                        <div className="text-center text-gray-500 text-sm">
                            Chat feature coming soon...
                        </div>
                    </div>
                    <div className="p-4 border-t">
                        <div className="flex space-x-2">
                            <input 
                                type="text" 
                                placeholder="Type a message..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled
                            />
                            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50">
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Overlay */}
            {showSettings && (
                <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-800">Call Settings</h3>
                        <button 
                            onClick={() => setShowSettings(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-700">Camera</span>
                            <button 
                                onClick={toggleVideo}
                                className={`px-3 py-1 rounded ${
                                    videoOn ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}
                            >
                                {videoOn ? 'On' : 'Off'}
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-700">Microphone</span>
                            <button 
                                onClick={toggleMic}
                                className={`px-3 py-1 rounded ${
                                    micOn ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}
                            >
                                {micOn ? 'On' : 'Off'}
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-700">Screen Share</span>
                            <button 
                                onClick={toggleScreenSharing}
                                className={`px-3 py-1 rounded ${
                                    screenSharing ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                {screenSharing ? 'Active' : 'Inactive'}
                            </button>
                        </div>
                        <div className="pt-2 border-t">
                            <button 
                                onClick={endCall}
                                className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                                End Call
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Recording Indicator */}
            {isRecording && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600 px-4 py-2 rounded-full">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">Recording</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoCall;