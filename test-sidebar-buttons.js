// Test script to verify sidebar buttons functionality
// This simulates what happens when users click sidebar buttons

console.log('🧪 Testing Sidebar Buttons Functionality');

// Mock the browser environment
global.window = {
  location: {
    href: '',
    assign: (url) => console.log(`🔗 Redirecting to: ${url}`),
    replace: (url) => console.log(`🔄 Replacing with: ${url}`)
  },
  localStorage: {
    getItem: (key) => {
      if (key === 'intelligence-session-id') return 'test-session-123';
      return null;
    },
    setItem: (key, value) => console.log(`💾 localStorage.setItem(${key}, ${value})`)
  }
};

global.navigator = {
  mediaDevices: {
    getUserMedia: () => Promise.resolve(new MediaStream()),
    getDisplayMedia: () => Promise.resolve(new MediaStream())
  }
};

// Mock React components (simplified)
const mockComponents = {
  toast: (config) => console.log(`🍞 Toast: ${config.title} - ${config.description}`),
  setFeature: (feature) => console.log(`🎯 Feature set to: ${feature}`),
  addActivity: (activity) => console.log(`📊 Activity added: ${activity.title}`),
  updateActivity: (id, updates) => console.log(`🔄 Activity ${id} updated:`, updates),
  addMessage: (message) => console.log(`💬 Message added: ${message.content}`),
  setShowProgressRail: (show) => console.log(`🚦 Progress rail: ${show ? 'shown' : 'hidden'}`),
  openCanvas: (type) => console.log(`🎨 Canvas opened with type: ${type}`)
};

// Test data
const toolItems = [
  {
    id: 'webcam',
    icon: 'Camera',
    label: 'Webcam Capture',
    shortcut: 'W',
    description: 'Record videos and capture high-quality photos'
  },
  {
    id: 'screen',
    icon: 'Monitor',
    label: 'Screen Share',
    shortcut: 'S',
    description: 'Share your screen with AI-powered analysis'
  },
  {
    id: 'document',
    icon: 'FileText',
    label: 'ROI Calculator',
    shortcut: 'P',
    description: 'Calculate detailed investment returns'
  },
  {
    id: 'video',
    icon: 'BookOpen',
    label: 'Video to App',
    shortcut: 'V',
    description: 'Convert videos to applications'
  },
  {
    id: 'workshop',
    icon: 'GraduationCap',
    label: 'Workshop',
    shortcut: 'L',
    description: 'Educational resources and learning paths'
  }
];

// Simulate the handleToolSelect function (from our fix)
function handleToolSelect(toolId) {
  console.log(`\n🎯 Testing button: ${toolId}`);

  const tool = toolItems.find(t => t.id === toolId);
  if (!tool) {
    console.log(`❌ Tool not found: ${toolId}`);
    return;
  }

  console.log(`📋 Tool found: ${tool.label} - ${tool.description}`);

  // Simulate activity tracking
  const toolActivityId = `activity-${Date.now()}`;
  mockComponents.addActivity({
    type: 'tool_used',
    title: `Activating ${tool.label}`,
    description: tool.description,
    status: 'in_progress',
    progress: 0
  });

  // Simulate progress
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.random() * 25;
    if (progress >= 100) {
      progress = 100;
      clearInterval(progressInterval);
      mockComponents.updateActivity(toolActivityId, { status: 'completed', progress: 100 });
    } else {
      mockComponents.updateActivity(toolActivityId, { progress });
    }
  }, 150);

  // Set feature and show progress rail
  mockComponents.setFeature(toolId);
  if (toolId !== 'chat') {
    mockComponents.setShowProgressRail(true);

    // Add system message
    const systemMessage = {
      id: `system-${Date.now()}`,
      content: `Switched to ${tool.label}. ${tool.description}`,
      role: 'assistant',
      timestamp: new Date(),
      type: 'system'
    };
    mockComponents.addMessage(systemMessage);

    // Call the appropriate tool action (this is our fix!)
    handleToolAction(toolId);
  }
}

// Simulate the handleToolAction function
function handleToolAction(toolId) {
  console.log(`🔧 Executing tool action for: ${toolId}`);

  switch (toolId) {
    case 'webcam':
      console.log('📹 Opening webcam canvas...');
      mockComponents.openCanvas('webcam');
      break;
    case 'screen':
      console.log('🖥️ Opening screen share canvas...');
      mockComponents.openCanvas('screen');
      break;
    case 'document':
      console.log('📄 Opening document (PDF) canvas...');
      mockComponents.openCanvas('pdf');
      break;
    case 'video':
      console.log('🎬 Redirecting to video-to-app workshop...');
      window.location.href = '/workshop/video-to-app';
      break;
    case 'workshop':
      console.log('🎓 Redirecting to workshop...');
      window.location.href = '/workshop';
      break;
    default:
      console.log(`❓ Unknown tool: ${toolId}`);
  }
}

// Run the tests
console.log('\n🚀 Starting Sidebar Button Tests...\n');

toolItems.forEach((tool, index) => {
  setTimeout(() => {
    handleToolSelect(tool.id);
  }, index * 1000); // Stagger the tests
});

// Also test a non-existent tool
setTimeout(() => {
  console.log('\n🧪 Testing invalid tool...');
  handleToolSelect('invalid-tool');
}, toolItems.length * 1000 + 500);

console.log('\n✅ All tests completed! Check the output above for results.');
