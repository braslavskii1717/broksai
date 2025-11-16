const OpenAI = require('openai');
const axios = require('axios');
const { Octokit } = require('@octokit/rest');
const fs = require('fs').promises;
const path = require('path');

const config = {
  openaiApiKey: process.env.OPENAI_API_KEY,
  perplexityApiKey: process.env.PERPLEXITY_API_KEY,
  githubToken: process.env.GITHUB_TOKEN,
  issueNumber: process.env.ISSUE_NUMBER,
  issueTitle: process.env.ISSUE_TITLE,
  issueBody: process.env.ISSUE_BODY,
  repository: process.env.REPOSITORY,
};

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
  ...(process.env.OPENAI_PROJECT_ID && { project: process.env.OPENAI_PROJECT_ID }),
  ...(process.env.OPENAI_ORG_ID && { organization: process.env.OPENAI_ORG_ID })
});
const octokit = new Octokit({ auth: config.githubToken });
const [owner, repo] = config.repository.split('/');

async function main() {
  try {
    console.log('🚀 Starting Codex <-> Perplexity automation...');
    console.log(`Processing Issue #${config.issueNumber}: ${config.issueTitle}`);

    const prompt = parseIssueBody(config.issueBody);
    console.log('📋 Parsed prompt:', prompt);

    console.log('🤖 Generating code with OpenAI...');
    const generatedCode = await generateCodeWithOpenAI(prompt);
    console.log('✅ Code generated');

    console.log('🔍 Validating with Perplexity...');
    const validation = await validateWithPerplexity(generatedCode, prompt);
    console.log('✅ Validation complete');

    const outputPath = '.github/output';
    await fs.mkdir(outputPath, { recursive: true });
    const fileName = `issue-${config.issueNumber}.js`;
    const filePath = path.join(outputPath, fileName);
    await fs.writeFile(filePath, generatedCode);
    console.log(`💾 Saved to ${filePath}`);

    await commentOnIssue(generatedCode, validation);
    console.log('💬 Posted to issue');

        console.log('🔀 Creating Pull Request...');
    await createPullRequest(fileName, config.issueTitle, config.issueNumber);
    console.log('✅ Pull Request created');

    console.log('✅ Automation completed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    await commentError(error);
    process.exit(1);
  }
}

function parseIssueBody(body) {
  const descMatch = body.match(/##[\s]*Description[\s\S]*?(?=##|$)/i);
  const reqMatch = body.match(/##[\s]*Requirements[\s\S]*?(?=##|$)/i);
  const techMatch = body.match(/##[\s]*Tech[\s\S]*?(?=##|$)/i);

  let prompt = `Task: ${config.issueTitle}\n\n`;
  if (descMatch) prompt += descMatch[0] + '\n';
  if (reqMatch) prompt += reqMatch[0] + '\n';
  if (techMatch) prompt += techMatch[0] + '\n';
  return prompt || body;
}

async function generateCodeWithOpenAI(prompt) {
    try {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: `You are an expert senior software engineer specializing in React, Node.js, and modern web development.

When generating code:
- Follow industry best practices and design patterns
- Write clean, maintainable, and well-documented code
- Include proper error handling and edge cases
- Add helpful comments explaining complex logic
- Use modern ES6+ syntax
- Ensure code is production-ready

Tech stack: React 18, Node.js 20, MongoDB, Express`
      { role: 'user', content: prompt }
    ],
    temperature:  0.2,
    max_tokens: 4000,
  });
  return response.choices[0].message.content;
        } catch (error) {
    console.error('Error generating code with OpenAI:', error.message);
    throw new Error(`Failed to generate code: ${error.message || 'Unknown error'}`);
  }
}

async function validateWithPerplexity(code, originalPrompt) {
    try {
  const validationPrompt = `Analyze this code:\n1. Correctness\n2. Security\n3. Performance\n4. Best practices\n\nRequirements:\n${originalPrompt}\n\nCode:\n\`\`\`javascript\n${code}\n\`\`\`\n\nProvide analysis with suggestions.`;

  const response = await axios.post(
    'https://api.perplexity.ai/chat/completions',
    {
      model: 'llama-3.1-sonar-large-128k-online',
      messages: [
        { role: 'system', content: 'You are an expert code reviewer specializing in security, performance, and best practices. Analyze provided code thoroughly for: security vulnerabilities and risks, performance optimization opportunities, best practice alignment, code maintainability and documentation, error handling completeness. Provide constructive, actionable feedback.' },
        { role: 'user', content: validationPrompt }
      ],
      2000,
    },
    {
      headers: {
        'Authorization': `Bearer ${config.perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.choices[0].message.content;
        } catch (error) {
    console.error('Error validating with Perplexity:', error.message);
    // Return fallback validation message if Perplexity fails
    return 'Validation unavailable. Please review code manually.';
  }
}

async function commentOnIssue(code, validation) {
  const comment = `## 🤖 Code Generation Complete\n\n### 💻 Generated Code\n\nSaved to \`.github/output/issue-${config.issueNumber}.js\`\n\n<details>\n<summary>View Code</summary>\n\n\`\`\`javascript\n${code.substring(0, 1500)}${code.length > 1500 ? '\n...(truncated)' : ''}\n\`\`\`\n\n</details>\n\n### ✅ Perplexity Validation\n\n${validation}\n\n### 📦 Next Steps\n1. Review code in PR\n2. Run tests\n3. Merge when ready\n\n---\n_🤖 Auto-generated by Codex <-> Perplexity_`;

  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: parseInt(config.issueNumber),
    body: comment,
  });
}

async function createPullRequest(fileName, issueTitle, issueNumber) {
  try {
    const branchName = `codex-issue-${issueNumber}`;
    
    // Get the default branch reference (main or master)
    const { data: ref } = await octokit.git.getRef({
      owner,
      repo,
      ref: 'heads/dev',
    });
    
    // Create a new branch from dev
    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: ref.object.sha,
    });
    
    // Read the generated file
    const filePath = `.github/output/${fileName}`;
    const fileContent = await fs.readFile(filePath, 'utf8');
    
    // Create/update file in the new branch
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: `feat: Add generated code for issue #${issueNumber}`,
      content: Buffer.from(fileContent).toString('base64'),
      branch: branchName,
    });
    
    // Create Pull Request
    const { data: pr } = await octokit.pulls.create({
      owner,
      repo,
      title: `🤖 ${issueTitle}`,
      head: branchName,
      base: 'dev',
      body: `## 🤖 Auto-generated Pull Request\n\nThis PR was automatically created by Codex for Issue #${issueNumber}.\n\n### 📝 Changes\n- Generated code based on issue requirements\n- Validated with Perplexity AI\n- Ready for review and testing\n\n### ✅ Next Steps\n1. Review generated code\n2. Run tests\n3. Merge when approved\n\nCloses #${issueNumber}\n\n---\n_🤖 Auto-generated by Codex <-> Perplexity_`,
    });
    
    // Comment on issue with PR link
    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: parseInt(issueNumber),
      body: `🔀 Pull Request created: #${pr.number}\n\n[View Pull Request](${pr.html_url})`,
    });
    
    console.log(`✅ PR #${pr.number} created: ${pr.html_url}`);
  } catch (error) {
    console.error('Error creating Pull Request:', error.message);
    // Don't throw error - just log it, automation can continue
  }
}


async function commentError(error) {
  const comment = `## ❌ Error\n\n**Message:** ${error.message}\n\n**Stack:**\n\`\`\`\n${error.stack}\n\`\`\`\n\nCheck GitHub Actions logs.\n\n---\n_🤖 Auto-reported_`;
  try {
    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: parseInt(config.issueNumber),
      body: comment,
    });
  } catch (e) {
    console.error('Failed to comment error:', e);
  }
}

main();
