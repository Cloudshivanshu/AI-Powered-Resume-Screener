const output = document.getElementById('output');
const upload = document.getElementById('upload');

async function processResume() {
  output.textContent = "Processing...";

  const file = upload.files[0];
  if (!file) {
    output.textContent = "Please upload a resume file.";
    return;
  }

  let text = "";

  if (file.type === "application/pdf") {
    text = await extractTextFromPDF(file);
  } else if (file.type === "text/plain") {
    text = await file.text();
  } else {
    output.textContent = "Unsupported file type. Upload PDF or TXT.";
    return;
  }

  // Extract info
  const extractedInfo = extractResumeInfo(text);
  
  output.textContent = JSON.stringify(extractedInfo, null, 2);
}

// Extract text from PDF using pdf.js
async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str);
    fullText += strings.join(" ") + "\n";
  }
  return fullText;
}

// Basic extraction of name, email, phone, skills
function extractResumeInfo(text) {
  const info = {};

  // Email regex
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/);
  info.email = emailMatch ? emailMatch[0] : "Not found";

  // Phone regex (basic US format, adjust if needed)
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/);
  info.phone = phoneMatch ? phoneMatch[0] : "Not found";

  // Name extraction - naive: Assume the first line or first two words are the name
  const lines = text.trim().split('\n').filter(line => line.trim() !== "");
  info.name = lines.length > 0 ? lines[0].trim() : "Not found";

  // Skills extraction: look for keywords in a skills section or whole text
  // Example skill keywords - you can expand this list
  const skillsList = ['JavaScript', 'Python', 'Java', 'C++', 'HTML', 'CSS', 'React', 'Node.js', 'Machine Learning', 'AI', 'TensorFlow', 'SQL'];
  
  // Find skills mentioned in text (case-insensitive)
  const skillsFound = skillsList.filter(skill => new RegExp(`\\b${skill}\\b`, 'i').test(text));
  info.skills = skillsFound.length ? skillsFound : ["Not found"];

  return info;
}
