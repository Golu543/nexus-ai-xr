import React, { useState, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, RoundedBox, Line } from '@react-three/drei';
import { XR, createXRStore } from '@react-three/xr';

// 1. Initialize WebXR v6+ Store
const xrStore = createXRStore({
  hand: true,
  controller: true,
});

const DEFAULT_NODES = [
  { id: 'node-1', label: 'Storefront UI', description: 'Responsive client-side interface.', position: [-0.55, 1.35, -0.85], color: '#00F5D4' },
  { id: 'node-2', label: 'API Gateway', description: 'Central routing layer connecting frontend to backend.', position: [0.0, 1.42, -0.78], color: '#00BBF9' },
  { id: 'node-3', label: 'Product Catalog', description: 'High-speed searchable database.', position: [-0.45, 1.0, -0.82], color: '#9B5DE5' },
  { id: 'node-4', label: 'Order & Cart', description: 'State management microservice tracking active sessions.', position: [0.45, 1.0, -0.82], color: '#F15BB5' },
  { id: 'node-5', label: 'Payment Engine', description: 'Encrypted transaction processor.', position: [0.55, 1.35, -0.85], color: '#FEE440' },
  { id: 'node-6', label: 'Auth & Identity', description: 'Zero-trust security layer managing user logins.', position: [0.0, 1.1, -0.92], color: '#38B000' }
];

const clampSpatialPosition = (pos) => {
  if (!Array.isArray(pos) || pos.length < 3) return [0, 1.2, -0.85];
  const clamp = (val, min, max) => Math.min(Math.max(Number(val) || 0, min), max);
  return [
    clamp(pos[0], -0.75, 0.75),
    clamp(pos[1], 0.88, 1.52),
    clamp(pos[2], -0.98, -0.72),
  ];
};
// Individual 3D Interactive Glassmorphic Node
function SpatialNode({ node, isSelected, onSelect, onExpandSubNodes, isExpanding, hasActiveSubNodes }) {
  const [hovered, setHovered] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);
  const meshRef = useRef();
  const ringRef = useRef();

  const baseRadius = node.isSubNode ? 0.048 : 0.075;

  useFrame((state, delta) => {
    if (meshRef.current) {
      const targetScale = isSelected ? 1.3 : hovered ? 1.15 : 1.0;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 8);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * (node.isSubNode ? 1.2 : 0.6);
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
    }
  });

  return (
    <Float speed={node.isSubNode ? 3.0 : 2.2} rotationIntensity={0.25} floatIntensity={0.35}>
      <group position={node.position}>
        <mesh
          ref={meshRef}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(isSelected ? null : node);
          }}
          onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
          onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
        >
          <sphereGeometry args={[baseRadius, 32, 32]} />
          <meshPhysicalMaterial
            color={node.color}
            transmission={0.75}
            opacity={1}
            transparent
            roughness={0.12}
            metalness={0.1}
            ior={1.45}
            thickness={0.5}
            emissive={node.color}
            emissiveIntensity={isSelected ? 0.8 : hovered ? 0.5 : 0.25}
          />
        </mesh>

        <mesh ref={ringRef}>
          <torusGeometry args={[baseRadius * 1.38, 0.0025, 16, 64]} />
          <meshBasicMaterial color={node.color} transparent opacity={isSelected || hovered ? 0.9 : 0.35} />
        </mesh>

        <Text
          position={[0, baseRadius + 0.06, 0]}
          fontSize={node.isSubNode ? 0.028 : 0.036}
          color={node.isSubNode ? '#E2E8F0' : '#FFFFFF'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.003}
          outlineColor="#050811"
        >
          {node.isSubNode ? `↳ ${node.label}` : node.label}
        </Text>

        {isSelected && (
          <group position={[0, -0.24, 0.06]}>
            <RoundedBox args={[0.5, 0.26, 0.014]} radius={0.02} smoothness={4}>
              <meshBasicMaterial color={node.color} transparent opacity={0.38} />
            </RoundedBox>

            <RoundedBox args={[0.485, 0.245, 0.018]} radius={0.018} smoothness={4}>
              <meshPhysicalMaterial color="#090D16" transmission={0.35} transparent opacity={0.94} roughness={0.25} metalness={0.1} />
            </RoundedBox>

            <Text position={[0, 0.08, 0.015]} fontSize={0.023} color={node.color} anchorX="center" anchorY="middle">
              {node.isSubNode ? `SUB-MODULE // ${node.label.toUpperCase()}` : node.label.toUpperCase()}
            </Text>

            <Text position={[0, node.isSubNode ? 0.0 : 0.015, 0.015]} fontSize={0.019} maxWidth={0.44} lineHeight={1.3} color="#E2E8F0" anchorX="center" anchorY="middle" textAlign="center">
              {node.description}
            </Text>

            {/* ONLY SHOW DEEP-DIVE BUTTON ON PRIMARY NODES */}
            {!node.isSubNode && (
              <group position={[0, -0.075, 0.02]}>
                <RoundedBox
                  args={[0.38, 0.048, 0.012]}
                  radius={0.01}
                  onClick={(e) => { e.stopPropagation(); onExpandSubNodes(node); }}
                  onPointerOver={(e) => { e.stopPropagation(); setBtnHovered(true); }}
                  onPointerOut={(e) => { e.stopPropagation(); setBtnHovered(false); }}
                >
                  <meshBasicMaterial color={btnHovered ? '#00F5D4' : '#1E293B'} transparent opacity={0.95} />
                </RoundedBox>
                <Text position={[0, 0, 0.01]} fontSize={0.017} color={btnHovered ? '#040814' : '#00F5D4'} anchorX="center" anchorY="middle">
                  {isExpanding 
                    ? 'SYNTHESIZING...' 
                    : hasActiveSubNodes 
                      ? '[ - COLLAPSE SUB-NODES ]' 
                      : '[ + DEEP-DIVE SUB-NODES ]'}
                </Text>
              </group>
            )}
          </group>
        )}
      </group>
    </Float>
  );
}

function SpatialSynapses({ nodes }) {
  const { primaryPoints, branchLines } = useMemo(() => {
    if (!nodes || nodes.length === 0) return { primaryPoints: [], branchLines: [] };
    const primary = nodes.filter((n) => !n.isSubNode);
    const primaryPts = primary.map((n) => new THREE.Vector3(...n.position));
    if (primaryPts.length > 2) primaryPts.push(new THREE.Vector3(...primary[0].position));

    const branches = [];
    nodes.forEach((n) => {
      if (n.isSubNode && n.parentId) {
        const parent = nodes.find((p) => p.id === n.parentId);
        if (parent) branches.push([new THREE.Vector3(...parent.position), new THREE.Vector3(...n.position)]);
      }
    });
    return { primaryPoints: primaryPts, branchLines: branches };
  }, [nodes]);

  return (
    <group>
      {primaryPoints.length >= 2 && <Line points={primaryPoints} color="#38BDF8" lineWidth={1.2} transparent opacity={0.22} />}
      {branchLines.map((pts, idx) => <Line key={`branch-${idx}`} points={pts} color="#FEE440" lineWidth={1.6} transparent opacity={0.55} />)}
    </group>
  );
}

function SpatialWorkspaceHeader({ currentTopic, isLoading, nodeCount }) {
  return (
    <group position={[0, 1.62, -0.95]}>
      <Text position={[0, 0.04, 0]} fontSize={0.04} color="#00F5D4" anchorX="center" anchorY="middle" outlineWidth={0.003} outlineColor="#000000">
        {isLoading ? 'SYNTHESIZING SPATIAL NODES...' : `NEXUS.AI // ${currentTopic.toUpperCase()}`}
      </Text>
      <Text position={[0, -0.015, 0]} fontSize={0.021} color="#94A3B8" anchorX="center" anchorY="middle">
        {`Active Spatial Nodes: ${nodeCount} • Pinch Node to Inspect or Deep-Dive`}
      </Text>
    </group>
  );
}

export default function App() {
  const [nodes, setNodes] = useState(DEFAULT_NODES);
  const [selectedNode, setSelectedNode] = useState(DEFAULT_NODES[1]);
  const [promptInput, setPromptInput] = useState('');
  const [currentTopic, setCurrentTopic] = useState('E-Commerce Architecture');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [isListening, setIsListening] = useState(false);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const generateProceduralFallback = (topic) => {
    const defaultColors = ['#00F5D4', '#00BBF9', '#9B5DE5', '#F15BB5', '#FEE440', '#38B000'];
    const keywords = topic.split(' ').filter((w) => w.length > 2);
    const templates = [
      { label: `${keywords[0] || 'Core'} Engine`, desc: `Core computation and autonomous logic layer for ${topic}.` },
      { label: `${keywords[1] || 'Sensor'} Telemetry`, desc: `Spatial perception and real-time environmental data acquisition.` },
      { label: `Control Mesh`, desc: `Decentralized routing and synchronization bus for active telemetry.` },
      { label: `Power & Thermal`, desc: `High-efficiency power distribution and thermal mitigation system.` },
      { label: `Neural Dispatch`, desc: `Agentic task orchestration and predictive recovery workflow.` },
      { label: `Security Boundary`, desc: `Zero-trust encryption envelope protecting mission commands.` },
    ];
    const arcRadius = 0.85;
    return templates.map((t, i) => {
      const angle = (i / (templates.length - 1) - 0.5) * (Math.PI * 0.7);
      return {
        id: `gen-node-${i + 1}`, label: t.label, description: t.desc,
        position: [Number((Math.sin(angle) * arcRadius).toFixed(2)), Number((1.15 + (i % 2 === 0 ? 0.15 : -0.1)).toFixed(2)), Number((-Math.cos(angle) * arcRadius).toFixed(2))],
        color: defaultColors[i % defaultColors.length],
      };
    });
  };

  const generateSpatialNodes = async (e, customVoicePrompt = null) => {
    if (e) e.preventDefault();
    const activePrompt = customVoicePrompt !== null ? customVoicePrompt : promptInput;
    const trimmedPrompt = activePrompt.trim();
    if (!trimmedPrompt || isLoading) return;

    setIsLoading(true); setErrorMsg(null); setSelectedNode(null);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const promptText = `Deconstruct "${trimmedPrompt}" into 5-6 3D spatial nodes.
Strict JSON format: { "nodes": [ { "id": "node-1", "label": "2-3 words", "description": "one sentence", "position": [0.0, 1.25, -0.85], "color": "#00F5D4" } ] }
Positions: x in [-0.65, 0.65], y in [1.0, 1.42], z in [-0.75, -0.92]. Colors: #00F5D4, #00BBF9, #9B5DE5, #F15BB5, #FEE440, #38B000.`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }], generationConfig: { responseMimeType: 'application/json' } }),
      });

      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      let rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawContent) throw new Error('Empty AI response');
      rawContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(rawContent);

      if (parsed?.nodes && Array.isArray(parsed.nodes) && parsed.nodes.length > 0) {
        const sanitizedNodes = parsed.nodes.slice(0, 6).map((node, index) => ({
          id: node.id || `node-${index + 1}`, label: node.label || `Concept ${index + 1}`, description: node.description || 'Spatial node details.',
          position: clampSpatialPosition(node.position), color: /^#[0-9A-Fa-f]{6}$/.test(node.color) ? node.color : '#00F5D4',
        }));
        setNodes(sanitizedNodes); setSelectedNode(sanitizedNodes[0]); setCurrentTopic(trimmedPrompt); setPromptInput('');
        showToast(`Synthesized ${sanitizedNodes.length} spatial nodes for "${trimmedPrompt}"`);
      } else throw new Error('Invalid JSON nodes');
    } catch (err) {
      clearTimeout(timeoutId);
      const fallbackNodes = generateProceduralFallback(trimmedPrompt);
      setNodes(fallbackNodes); setSelectedNode(fallbackNodes[0]); setCurrentTopic(trimmedPrompt); setPromptInput('');
      showToast(`Spawned 6 architecture nodes for "${trimmedPrompt}"`);
    } finally { setIsLoading(false); }
  };

  // TOGGLE FEATURE: Deep-Dive Sub-Node Expansion (Expands AND Collapses)
 // TOGGLE FEATURE: Deep-Dive Sub-Node Expansion (Expands AND Collapses)
  const expandSubNodes = async (parentNode) => {
    if (isExpanding) return;

    // Check if sub-nodes are already open. If YES, collapse them!
    const alreadyExpanded = nodes.some((n) => n.parentId === parentNode.id);
    if (alreadyExpanded) {
      setNodes((prev) => prev.filter((n) => n.parentId !== parentNode.id));
      showToast(`Collapsed sub-nodes for "${parentNode.label}"`);
      return; // Exit here so it doesn't fetch again
    }

    // If NOT open, fetch and expand them
    setIsExpanding(true);
    const [px, py, pz] = parentNode.position;
    const offsets = [[-0.2, 0.16, -0.06], [0.0, 0.22, -0.08], [0.2, 0.16, -0.06]];

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // Increased timeout to 8 seconds

    try {
      const promptText = `Break down the sub-component "${parentNode.label}" (from system "${currentTopic}") into exactly 3 micro-modules.
Strict JSON format: { "subnodes": [ { "label": "2 words", "description": "short 1 sentence role" } ] }`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }], generationConfig: { responseMimeType: 'application/json' } }),
      });

      clearTimeout(timeoutId);
      const data = await res.json();
      let raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      raw = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(raw);

      if (parsed?.subnodes && parsed.subnodes.length > 0) {
        const newSubNodes = parsed.subnodes.slice(0, 3).map((sub, i) => ({
          id: `${parentNode.id}-sub-${i + 1}`, parentId: parentNode.id, isSubNode: true,
          label: sub.label || `${parentNode.label} #${i + 1}`, description: sub.description || `Sub-module of ${parentNode.label}.`,
          position: clampSpatialPosition([px + offsets[i][0], py + offsets[i][1], pz + offsets[i][2]]), color: parentNode.color,
        }));
        setNodes((prev) => [...prev, ...newSubNodes]);
        showToast(`Expanded 3 AI sub-nodes for ${parentNode.label}`);
      } else throw new Error('Fallback sub-nodes');
    } catch {
      clearTimeout(timeoutId);
      
      // --- SMART DYNAMIC FALLBACK DICTIONARY ---
      // Evaluates the parent label to dynamically assign diverse architectures
      const baseWord = parentNode.label.replace(/[^a-zA-Z0-9 ]/g, '').split(' ')[0] || 'Module';
      const hash = parentNode.label.length;
      
      // 4 Different Architectural Patterns so they don't repeat
      const patterns = [
        [ { suffix: 'Gateway', desc: `Entry point and request routing.` }, { suffix: 'Processor', desc: `Core computation and logic.` }, { suffix: 'Store', desc: `State and data persistence.` } ],
        [ { suffix: 'Queue', desc: `Asynchronous message broker.` }, { suffix: 'Worker', desc: `Background task executor.` }, { suffix: 'Cache', desc: `High-speed memory layer.` } ],
        [ { suffix: 'Router', desc: `Traffic distribution and load balancing.` }, { suffix: 'Resolver', desc: `Data aggregation endpoint.` }, { suffix: 'Sync', desc: `State synchronization.` } ],
        [ { suffix: 'Auth', desc: `Security, validation, and token verification.` }, { suffix: 'Engine', desc: `High-performance execution environment.` }, { suffix: 'Ledger', desc: `Immutable audit trail.` } ]
      ];
      
      const selectedPattern = patterns[hash % patterns.length];

      const fallbackSubs = selectedPattern.map((sub, i) => ({
        id: `${parentNode.id}-sub-${i + 1}`, parentId: parentNode.id, isSubNode: true,
        label: `${baseWord} ${sub.suffix}`, description: sub.desc,
        position: clampSpatialPosition([px + offsets[i][0], py + offsets[i][1], pz + offsets[i][2]]), color: parentNode.color,
      }));
      
      setNodes((prev) => [...prev, ...fallbackSubs]);
      showToast(`Expanded 3 dynamic sub-modules for "${parentNode.label}"`);
    } finally { setIsExpanding(false); }
  };
  const exportToMermaid = () => {
    let mermaid = `graph TD\n  %% Nexus.AI Spatial Architecture: ${currentTopic}\n`;
    const primary = nodes.filter((n) => !n.isSubNode);
    primary.forEach((n, idx) => {
      const next = primary[(idx + 1) % primary.length];
      mermaid += `  ${n.id}["${n.label.replace(/"/g, '')}"] --> ${next.id}["${next.label.replace(/"/g, '')}"]\n`;
    });
    nodes.filter((n) => n.isSubNode).forEach((sub) => {
      mermaid += `  ${sub.parentId} -.-> ${sub.id}("${sub.label.replace(/"/g, '')}")\n`;
    });
    navigator.clipboard.writeText(mermaid);
    showToast('Copied Mermaid.js Architecture Diagram to Clipboard!');
  };

  const exportToJSON = () => {
    const payload = { project: 'Nexus.AI Spatial Architecture', topic: currentTopic, timestamp: new Date().toISOString(), ergonomicZone: 'Seated Airplane Seat Envelope', totalNodes: nodes.length, nodes };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `${currentTopic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-spatial-spec.json`;
    a.click(); URL.revokeObjectURL(url);
    showToast('Downloaded Spatial Architecture JSON Spec!');
  };

  const triggerVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return setErrorMsg('Web Speech API is not supported in this browser. Try Chrome or Edge.');
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; recognition.interimResults = false;
    recognition.onstart = () => { setIsListening(true); showToast('Listening... Speak your system architecture prompt'); };
    recognition.onend = () => setIsListening(false); recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setPromptInput(transcript); generateSpatialNodes(null, transcript);
    };
    recognition.start();
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'radial-gradient(circle at 50% 35%, #111827 0%, #050811 100%)', position: 'relative', overflow: 'hidden', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 20, display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
        <button onClick={() => xrStore.enterAR()} style={{ padding: '11px 18px', background: 'linear-gradient(135deg, #00F5D4 0%, #00BBF9 100%)', color: '#040814', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0, 245, 212, 0.35)' }}>Enter AR (Passthrough)</button>
        <button onClick={() => xrStore.enterVR()} style={{ padding: '11px 18px', background: 'rgba(155, 93, 229, 0.2)', color: '#F8FAFC', border: '1px solid rgba(155, 93, 229, 0.6)', backdropFilter: 'blur(12px)', borderRadius: '12px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Enter VR Mode</button>
      </div>

      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 20, display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
        <button onClick={exportToMermaid} title="Copy Mermaid.js Diagram to Clipboard" style={{ padding: '8px 14px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(0, 245, 212, 0.4)', backdropFilter: 'blur(10px)', borderRadius: '10px', color: '#00F5D4', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>📋 Copy Mermaid.js</button>
        <button onClick={exportToJSON} title="Download Spatial JSON Spec" style={{ padding: '8px 14px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(56, 189, 248, 0.4)', backdropFilter: 'blur(10px)', borderRadius: '10px', color: '#38BDF8', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>⬇ Export JSON</button>
        <div style={{ padding: '8px 14px', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(10px)', borderRadius: '999px', color: '#94A3B8', fontSize: '12px', fontWeight: 500 }}><span style={{ color: '#00F5D4', marginRight: '6px' }}>●</span>Hands-First Seated Zone</div>
      </div>

      {toastMsg && <div style={{ position: 'absolute', top: '76px', left: '50%', transform: 'translateX(-50%)', zIndex: 30, background: 'rgba(0, 245, 212, 0.15)', border: '1px solid rgba(0, 245, 212, 0.5)', backdropFilter: 'blur(12px)', color: '#00F5D4', padding: '9px 20px', borderRadius: '999px', fontSize: '13px', fontWeight: 600, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)' }}>✓ {toastMsg}</div>}
      {errorMsg && <div style={{ position: 'absolute', top: '76px', left: '50%', transform: 'translateX(-50%)', zIndex: 30, background: 'rgba(239, 68, 68, 0.18)', border: '1px solid rgba(239, 68, 68, 0.5)', backdropFilter: 'blur(12px)', color: '#FCA5A5', padding: '10px 20px', borderRadius: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '12px' }}><span>{errorMsg}</span><button onClick={() => setErrorMsg(null)} style={{ background: 'transparent', border: 'none', color: '#FCA5A5', cursor: 'pointer', fontWeight: 700 }}>✕</button></div>}

      <Canvas camera={{ position: [0, 1.25, 0.15], fov: 60 }}>
        <XR store={xrStore}>
          <ambientLight intensity={0.9} />
          <directionalLight position={[2, 4, 2]} intensity={1.4} />
          <pointLight position={[0, 1.3, -0.5]} intensity={1.2} color="#00F5D4" />

          <SpatialWorkspaceHeader currentTopic={currentTopic} isLoading={isLoading} nodeCount={nodes.length} />
          <SpatialSynapses nodes={nodes} />

          {nodes.map((node) => (
            <SpatialNode
              key={node.id}
              node={node}
              isSelected={selectedNode?.id === node.id}
              onSelect={setSelectedNode}
              onExpandSubNodes={expandSubNodes}
              isExpanding={isExpanding && selectedNode?.id === node.id}
              hasActiveSubNodes={nodes.some(n => n.parentId === node.id)}
            />
          ))}

          <mesh position={[0, 1.2, -2]} onClick={() => setSelectedNode(null)} visible={false}><planeGeometry args={[10, 10]} /></mesh>
          <OrbitControls target={[0, 1.2, -0.85]} enablePan={false} minDistance={0.3} maxDistance={2.2} />
        </XR>
      </Canvas>

      <div style={{ position: 'absolute', bottom: '28px', left: '50%', transform: 'translateX(-50%)', zIndex: 20, width: '92%', maxWidth: '680px' }}>
        <form onSubmit={(e) => generateSpatialNodes(e, null)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'rgba(15, 23, 42, 0.72)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', border: '1px solid rgba(255, 255, 255, 0.14)', borderRadius: '16px', boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)' }}>
          <button type="button" onClick={triggerVoiceInput} title="Hands-Free Voice Dictation (Auto-Spawns Nodes)" style={{ padding: '10px 14px', background: isListening ? 'rgba(241, 91, 181, 0.35)' : 'rgba(255, 255, 255, 0.06)', border: isListening ? '1px solid #F15BB5' : '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: isListening ? '#F15BB5' : '#CBD5E1', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>{isListening ? '● Listening...' : '🎤 Voice'}</button>
          <input type="text" value={promptInput} onChange={(e) => setPromptInput(e.target.value)} placeholder="Speak or type any system (e.g., 'Design an Autonomous Rover System')..." disabled={isLoading} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#F8FAFC', fontSize: '14px', padding: '6px 8px' }} />
          <button type="submit" disabled={isLoading || !promptInput.trim()} style={{ padding: '10px 20px', background: isLoading || !promptInput.trim() ? 'rgba(148, 163, 184, 0.2)' : 'linear-gradient(135deg, #00F5D4 0%, #00BBF9 100%)', color: isLoading || !promptInput.trim() ? '#64748B' : '#040814', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: isLoading || !promptInput.trim() ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap' }}>{isLoading ? 'Synthesizing...' : 'Spawn Nodes'}</button>
        </form>
      </div>
    </div>
  );
}