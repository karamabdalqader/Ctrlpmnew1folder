import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Divider,
  FormControl,
  Menu,
  MenuItem,
  Switch,
  Typography,
  FormControlLabel,
  FormLabel,
  FormGroup,
  RadioGroup,
  Radio,
  IconButton,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import StopIcon from '@mui/icons-material/Stop';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';

const FloatingCard = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: '20px',
  right: '20px',
  padding: theme.spacing(1.5),
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  zIndex: 9999,
  boxShadow: theme.shadows[3],
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const RecordButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'isRecording',
})<{ isRecording?: boolean }>(({ theme, isRecording }) => ({
  color: isRecording ? theme.palette.error.main : theme.palette.success.main,
  animation: isRecording ? 'pulse 2s infinite' : 'none',
  '@keyframes pulse': {
    '0%': { opacity: 1 },
    '50%': { opacity: 0.5 },
    '100%': { opacity: 1 },
  },
}));

const WebcamOverlay = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  width: '240px',
  height: '180px',
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  zIndex: 9998,
  '& video': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
}));

interface RecordingSettings {
  enableMic: boolean;
  enableWebcam: boolean;
  autoDownload: boolean;
  recordingQuality: 'high' | 'medium' | 'low';
}

export default function ScreenRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [settings, setSettings] = useState<RecordingSettings>({
    enableMic: true,
    enableWebcam: false,
    autoDownload: true,
    recordingQuality: 'high',
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<{ data: Blob; timestamp: number }[]>([]);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);

  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setAnchorEl(null);
  };

  const updateSetting = <K extends keyof RecordingSettings>(
    key: K,
    value: RecordingSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const startRecording = async () => {
    try {
      // Get display stream first
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: true // Get system audio
      });

      // Initialize audio streams array
      let audioStreams: MediaStream[] = [];
      
      // Get microphone stream if enabled
      if (settings.enableMic) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: false,
              channelCount: 2,
              sampleRate: 48000,
              latency: 0
            }
          });
          audioStreams.push(micStream);
        } catch (err) {
          console.warn('Could not get microphone access:', err);
        }
      }

      // Get webcam stream if enabled
      if (settings.enableWebcam) {
        try {
          const webcamStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              frameRate: { ideal: 30 }
            }
          });
          webcamStreamRef.current = webcamStream;
          if (webcamVideoRef.current) {
            webcamVideoRef.current.srcObject = webcamStream;
            webcamVideoRef.current.play();
          }
        } catch (err) {
          console.warn('Could not get webcam access:', err);
        }
      }

      // Add system audio if available
      if (displayStream.getAudioTracks().length > 0) {
        audioStreams.push(displayStream);
      }

      // Create audio context and mix audio streams
      const audioContext = new AudioContext({
        sampleRate: 48000,
        latencyHint: 'interactive'
      });
      const destination = audioContext.createMediaStreamDestination();

      // Create gain nodes for each audio source
      audioStreams.forEach((stream, index) => {
        stream.getAudioTracks().forEach(track => {
          if (track.readyState === 'live') {
            const source = audioContext.createMediaStreamSource(new MediaStream([track]));
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 1.0;
            source.connect(gainNode).connect(destination);
            console.log(`Connected audio track ${index} to destination`);
          }
        });
      });

      // Get the mixed audio stream
      const mixedAudioStream = destination.stream;
      console.log('Mixed audio tracks:', mixedAudioStream.getAudioTracks().length);

      // Create final stream with video and mixed audio
      const combinedStream = new MediaStream();
      
      // Add video track from display stream
      const videoTrack = displayStream.getVideoTracks()[0];
      if (videoTrack) {
        combinedStream.addTrack(videoTrack);
        console.log('Added video track to combined stream');
      }

      // Add mixed audio tracks
      mixedAudioStream.getAudioTracks().forEach(track => {
        combinedStream.addTrack(track);
        console.log('Added mixed audio track to combined stream');
      });

      // Store all streams for cleanup
      const allStreams = [displayStream, ...audioStreams];

      // Try different MIME types in order of preference
      const mimeTypes = [
        'video/webm;codecs=vp8,opus',
        'video/webm'
      ];

      let selectedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';
      console.log('Using MIME type:', selectedMimeType);

      const options: MediaRecorderOptions = {
        mimeType: selectedMimeType,
        videoBitsPerSecond: settings.recordingQuality === 'high' ? 8000000 :
                           settings.recordingQuality === 'medium' ? 4000000 : 2000000,
        audioBitsPerSecond: 256000 // Increased for better audio quality
      };

      console.log('Recording with options:', options);
      const mediaRecorder = new MediaRecorder(combinedStream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Record in smaller chunks for better seeking
      const CHUNK_INTERVAL = 250; // 250ms chunks for better seeking
      let startTime = 0;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          console.log(`Received chunk of size: ${event.data.size}`);
          chunksRef.current.push({
            data: event.data,
            timestamp: startTime
          });
          startTime += CHUNK_INTERVAL;
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('Recording stopped, processing chunks...');
        
        // Stop all tracks and clean up
        allStreams.forEach(stream => {
          stream.getTracks().forEach(track => {
            track.stop();
            console.log(`Stopped track: ${track.kind}`);
          });
        });

        if (webcamStreamRef.current) {
          webcamStreamRef.current.getTracks().forEach(track => track.stop());
          webcamStreamRef.current = null;
        }

        // Close audio context
        await audioContext.close();
        console.log('Audio context closed');

        const processAndDownload = async () => {
          try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            
            // Combine all chunks into a single blob
            const chunks = chunksRef.current.map(chunk => chunk.data);
            console.log(`Processing ${chunks.length} chunks`);
            
            // Create WebM blob
            const webmBlob = new Blob(chunks, { type: 'video/webm' });
            console.log(`Created video blob of size: ${webmBlob.size}`);

            // Convert WebM to MP4 using FFmpeg
            const ffmpeg = document.createElement('script');
            ffmpeg.src = 'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.11.0/dist/ffmpeg.min.js';
            document.body.appendChild(ffmpeg);

            ffmpeg.onload = async () => {
              try {
                // Create a temporary URL for the WebM file
                const webmUrl = URL.createObjectURL(webmBlob);
                
                // Download as WebM for now (temporary solution)
                const a = document.createElement('a');
                a.href = webmUrl;
                a.download = `screen-recording-${timestamp}.webm`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(webmUrl);

                // Also provide a link to open in VLC
                const openInVlc = document.createElement('a');
                openInVlc.href = 'vlc://' + webmUrl;
                openInVlc.textContent = 'Open in VLC';
                document.body.appendChild(openInVlc);
                
                // Show instructions to the user
                console.log('Video saved! For best playback:');
                console.log('1. Install VLC Media Player if not already installed');
                console.log('2. Right-click the downloaded file');
                console.log('3. Select "Open with" -> "VLC Media Player"');
                
                // Clean up
                document.body.removeChild(ffmpeg);
              } catch (error) {
                console.error('Error during conversion:', error);
              }
            };

          } catch (error) {
            console.error('Error processing video:', error);
          }
        };

        await processAndDownload();
        setIsRecording(false);
      };

      // Start recording with regular intervals
      mediaRecorder.start(CHUNK_INTERVAL);
      setIsRecording(true);
      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <>
      {settings.enableWebcam && (
        <WebcamOverlay>
          <video ref={webcamVideoRef} autoPlay muted playsInline />
        </WebcamOverlay>
      )}
      <FloatingCard>
        <Tooltip title={isRecording ? "Stop Recording" : "Start Recording"}>
          <RecordButton
            isRecording={isRecording}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? <StopIcon /> : <FiberManualRecordIcon />}
          </RecordButton>
        </Tooltip>

        <Tooltip title={settings.enableMic ? "Disable Microphone" : "Enable Microphone"}>
          <IconButton 
            onClick={() => updateSetting('enableMic', !settings.enableMic)}
            disabled={isRecording}
            color={settings.enableMic ? "primary" : "default"}
          >
            {settings.enableMic ? <MicIcon /> : <MicOffIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title={settings.enableWebcam ? "Disable Webcam" : "Enable Webcam"}>
          <IconButton 
            onClick={() => updateSetting('enableWebcam', !settings.enableWebcam)}
            disabled={isRecording}
            color={settings.enableWebcam ? "primary" : "default"}
          >
            {settings.enableWebcam ? <VideocamIcon /> : <VideocamOffIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Settings">
          <IconButton onClick={handleSettingsClick} disabled={isRecording}>
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      </FloatingCard>

      <Menu
        id="screen-recorder-settings"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleSettingsClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          '& .MuiPaper-root': {
            backgroundColor: 'background.paper',
            boxShadow: 3,
            borderRadius: 2,
            minWidth: 250,
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
            Recording Settings
          </Typography>
          
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <FormLabel component="legend">Quality</FormLabel>
            <RadioGroup
              value={settings.recordingQuality}
              onChange={(e) => updateSetting('recordingQuality', e.target.value as 'high' | 'medium' | 'low')}
            >
              <FormControlLabel value="high" control={<Radio size="small" />} label="High" />
              <FormControlLabel value="medium" control={<Radio size="small" />} label="Medium" />
              <FormControlLabel value="low" control={<Radio size="small" />} label="Low" />
            </RadioGroup>
          </FormControl>

          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableMic}
                  onChange={(e) => updateSetting('enableMic', e.target.checked)}
                  size="small"
                />
              }
              label="Enable Microphone"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableWebcam}
                  onChange={(e) => updateSetting('enableWebcam', e.target.checked)}
                  size="small"
                />
              }
              label="Enable Webcam"
            />
          </FormGroup>

          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            <InfoIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
            Recording will automatically download when stopped.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
            Processing may take a few moments after stopping.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <PlayArrowIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
            For best playback, use VLC Media Player.
          </Typography>
        </Box>
      </Menu>
    </>
  );
}
