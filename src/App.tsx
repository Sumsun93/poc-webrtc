import {useEffect, useRef, useState} from "react";
import './App.css';
import Peer from "peerjs";

const App = () => {
  const [peerId, setPeerId] = useState('');
  const [remotePeerId, setRemotePeerId] = useState('');
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const ownVideoRef = useRef<HTMLVideoElement>(null);
  const peer = useRef<Peer>();

  useEffect(() => {
    peer.current = new Peer();

    peer.current.on('open', (streamId) => {
      setPeerId(streamId);
    });

    peer.current.on('call', async (call) => {
      const getUserMedia = navigator.mediaDevices.getUserMedia;

      const stream = await getUserMedia({video: false, audio: true});

      if (!ownVideoRef.current) return;
      ownVideoRef.current.srcObject = stream;
      await ownVideoRef.current.play();

      call.answer(stream);
      call.on('stream', (remoteStream) => {
        if (!remoteVideoRef.current) return;
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.play();
      })
    })
  }, []);

  const handleCall = async () => {
    const getUserMedia = navigator.mediaDevices.getUserMedia;

    const stream = await getUserMedia({video: true, audio: false});

    if (!ownVideoRef.current) return;
    ownVideoRef.current.srcObject = stream;
    await ownVideoRef.current.play();

    const call = peer.current?.call(remotePeerId, stream)

    if (!call) return;

    call.answer(stream);
    call.on('stream', (remoteStream) => {
      if (!remoteVideoRef.current) return;
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play();
    })
  }

  return (
    <div>
      <h1>peerId: {peerId}</h1>
      <input value={remotePeerId} onChange={(evt) => setRemotePeerId(evt.target.value)} />
      <button onClick={handleCall}>Call</button>

      <video ref={ownVideoRef} />
      <video ref={remoteVideoRef} />
    </div>
  )
}

export default App
