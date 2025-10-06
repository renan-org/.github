#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Search for repositories with matching topics using GitHub CLI
 */
async function searchRepositories() {
  try {
    // Get environment variables
    const sourceOrg = process.env.SOURCE_ORG;
    const cleanedTopics = process.env.CLEANED_TOPICS;

    if (!sourceOrg || !cleanedTopics) {
      throw new Error('Missing required environment variables: SOURCE_ORG, CLEANED_TOPICS');
    }

    console.log(`Searching for repositories in ${sourceOrg} with topics: ${cleanedTopics}`);

    // Convert comma-separated topics to array
    const topics = cleanedTopics.split(',').map(topic => topic.trim());

    // Create temporary file to collect all repositories
    const allRepos = [];
    const tempFiles = [];

    // Search for repositories with each topic
    for (const topic of topics) {
      console.log(`Searching for repositories with topic: ${topic}`);
      
      const tempFileName = `temp_repos_${topic}.json`;
      tempFiles.push(tempFileName);

      try {
        // Use gh search repos command
        const command = `gh search repos --owner "${sourceOrg}" --topic "${topic}" --include-forks true --json name,fullName,url --limit 1000`;
        const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
        
        // Parse and validate JSON result
        let repos;
        try {
          repos = JSON.parse(result.trim());
        } catch (parseError) {
          console.warn(`Failed to parse JSON for topic ${topic}, using empty array`);
          repos = [];
        }

        // Write to temporary file
        fs.writeFileSync(tempFileName, JSON.stringify(repos, null, 2));
        
        // Check if file has content
        if (!repos || repos.length === 0) {
          fs.writeFileSync(tempFileName, '[]');
        }
      } catch (error) {
        console.warn(`Search failed for topic ${topic}, using empty array`);
        fs.writeFileSync(tempFileName, '[]');
      }
    }

    // Combine all repositories and remove duplicates
    const allReposData = [];
    for (const tempFile of tempFiles) {
      try {
        const fileContent = fs.readFileSync(tempFile, 'utf8');
        const repos = JSON.parse(fileContent);
        allReposData.push(...repos);
      } catch (error) {
        console.warn(`Failed to read ${tempFile}, skipping`);
      }
    }

    // Remove duplicates by name
    const uniqueRepos = allReposData.filter((repo, index, self) => 
      index === self.findIndex(r => r.name === repo.name)
    );

    fs.writeFileSync('unique_repos.json', JSON.stringify(uniqueRepos, null, 2));

    // Check if we have any repositories to process
    if (uniqueRepos.length === 0) {
      console.log('❌ No repositories found with any of the specified topics');
      // Cleanup
      tempFiles.forEach(file => {
        try { fs.unlinkSync(file); } catch {}
      });
      try { fs.unlinkSync('unique_repos.json'); } catch {}
      
      // Set GitHub Actions output
      execSync(`echo "repos_found=false" >> $GITHUB_OUTPUT`);
      process.exit(1);
    }

    // For each repository, fetch topics and check if it has ALL required topics
    console.log('Checking topics for each repository...');
    const searchResults = [];

    for (const repo of uniqueRepos) {
      const repoName = repo.name;
      const fullName = repo.fullName;
      const url = repo.url;

      console.log(`Checking topics for repository: ${repoName}`);

      try {
        // Get repository topics using GitHub API
        const topicsCommand = `gh api repos/${fullName}/topics --jq '.names'`;
        const topicsResult = execSync(topicsCommand, { encoding: 'utf8', stdio: 'pipe' });
        
        let repoTopics;
        try {
          repoTopics = JSON.parse(topicsResult.trim());
        } catch {
          repoTopics = [];
        }

        // Check if repository has ALL required topics
        const hasAllTopics = topics.every(requiredTopic => 
          repoTopics.includes(requiredTopic)
        );

        if (hasAllTopics) {
          console.log(`✅ Repository ${repoName} has all required topics`);
          
          // Create repository object
          searchResults.push({
            name: repoName,
            full_name: fullName,
            topics: repoTopics,
            clone_url: `${url}.git`
          });
        } else {
          console.log(`❌ Repository ${repoName} does not have all required topics`);
        }
      } catch (error) {
        console.warn(`Failed to get topics for ${repoName}:`, error.message);
      }
    }

    // Write search results
    fs.writeFileSync('search_results.json', JSON.stringify(searchResults, null, 2));

    // Cleanup temporary files
    tempFiles.forEach(file => {
      try { fs.unlinkSync(file); } catch {}
    });
    try { fs.unlinkSync('unique_repos.json'); } catch {}

    // Check if any repositories were found
    if (searchResults.length === 0) {
      console.log('❌ No repositories found with all specified topics');
      execSync(`echo "repos_found=false" >> $GITHUB_OUTPUT`);
      process.exit(1);
    } else {
      const repoCount = searchResults.length;
      console.log(`✅ Found ${repoCount} repositories matching all topics`);
      
      // Set GitHub Actions outputs
      execSync(`echo "repos_found=true" >> $GITHUB_OUTPUT`);
      execSync(`echo "REPO_COUNT=${repoCount}" >> $GITHUB_ENV`);

      // Display found repositories
      console.log('Found repositories:');
      searchResults.forEach(repo => console.log(repo.full_name));
    }

  } catch (error) {
    console.error('Error during repository search:', error.message);
    execSync(`echo "repos_found=false" >> $GITHUB_OUTPUT`);
    process.exit(1);
  }
}

// Run the function
searchRepositories();
