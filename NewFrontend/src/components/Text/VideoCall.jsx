import { useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Peer from "peerjs";
import { Mic, MicOff, Video, VideoOff, Phone } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import React from "react";
import { url } from "../../lib/PostUrl";
import { StudentContext } from "../Student/StudentContextProvider";

// const socket = io(`${url}`);

const VideoCall = () => {
  const {socket} = useContext(StudentContext);
  const navigate = useNavigate();
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [remoteStream, setRemoteStream] = useState(null);
  const [localStream, setLocalStream] = useState(null);

  const location = useLocation();
  const { sender, receiver } = location.state || {};

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerInstance = useRef(null);
  const callInstance = useRef(null);

  useEffect(() => {
    const getMedia = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const peer = new Peer(undefined, {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });

      peer.on("open", (id) => {
        socket.emit("joinRoom", { sender, receiver, peerId: id });
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
      });

      peerInstance.current = peer;
    };

    getMedia();

    socket.on("call-ended", () => {
      endCall();
    });

    return () => {
      socket.off("call-ended");
    };
  }, []);

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks()[0].enabled = !micOn;
      setMicOn(!micOn);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks()[0].enabled = !videoOn;
      setVideoOn(!videoOn);
    }
  };

  const endCall = () => {
    // Notify server
    socket.emit("end-call", { sender, receiver });

    // Stop local media tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    // Clear video elements
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    // Close peer call
    if (callInstance.current) {
      callInstance.current.close();
    }

    // Destroy peer connection
    if (peerInstance.current) {
      peerInstance.current.destroy();
    }

    // Optional: redirect or alert
    alert("Call Ended");
    navigate(-1);
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <div className="flex-1 relative">
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
        <video ref={localVideoRef} autoPlay muted playsInline className="w-48 h-36 absolute bottom-4 right-4 border-2 border-white rounded-lg shadow-lg object-cover" />
      </div>

      <div className="bg-gray-900 p-4 flex justify-center items-center space-x-4">
        <button onClick={toggleMic} className={`p-3 rounded-full ${micOn ? 'bg-gray-700' : 'bg-red-600'}`}>
          {micOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        <button onClick={toggleVideo} className={`p-3 rounded-full ${videoOn ? 'bg-gray-700' : 'bg-red-600'}`}>
          {videoOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>
        <button onClick={endCall} className="p-3 rounded-full bg-red-600">
          <Phone size={20} />
        </button>
      </div>
    </div>
  );
};

export default VideoCall;