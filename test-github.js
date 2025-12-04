#!/usr/bin/env node

/**
 * Simple GitHub API test script
 * Fetches the last commit from the current repository
 * 
 * Prerequisites:
 * - Set GITHUB_TOKEN environment variable
 * - Run: npm install node-fetch (or use built-in fetch in Node.js 18+)
 * 
 * Usage:
 * GITHUB_TOKEN=your_token node test-github.js
 */

const fetch = require('node-fetch').default || fetch; // Support both Node.js versions

async function testGitHubAPI() {
    // Get GitHub token from environment
    const token = process.env.GITHUB_TOKEN;
    
    if (!token) {
        console.error('❌ Error: GITHUB_TOKEN environment variable is not set');
        console.log('💡 Usage: GITHUB_TOKEN=your_token node test-github.js');
        process.exit(1);
    }

    // Repository info (can be extracted from git or hardcoded for testing)
    const owner = 'renan-org';
    const repo = '.github';
    
    console.log('🚀 Testing GitHub API connection...');
    console.log(`📂 Repository: ${owner}/${repo}`);
    console.log(`🔑 Token: ${token.substring(0, 4)}...${token.slice(-4)}`);
    
    try {
        // Fetch the latest commit
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'test-github-script'
            }
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }

        const commits = await response.json();
        
        if (commits.length === 0) {
            console.log('⚠️  No commits found in repository');
            return;
        }

        const lastCommit = commits[0];
        
        console.log('\n✅ Successfully connected to GitHub API!');
        console.log('\n📝 Last Commit Information:');
        console.log(`   SHA: ${lastCommit.sha}`);
        console.log(`   Message: ${lastCommit.commit.message}`);
        console.log(`   Author: ${lastCommit.commit.author.name} <${lastCommit.commit.author.email}>`);
        console.log(`   Date: ${new Date(lastCommit.commit.author.date).toLocaleString()}`);
        console.log(`   URL: ${lastCommit.html_url}`);

        // Also test user info to verify token permissions
        console.log('\n👤 Testing token permissions...');
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'test-github-script'
            }
        });

        if (userResponse.ok) {
            const user = await userResponse.json();
            console.log(`   Authenticated as: ${user.login} (${user.name || 'No name set'})`);
        } else {
            console.log(`   ⚠️  Could not fetch user info: ${userResponse.status}`);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run the test
testGitHubAPI();
