Rails guides prompt

Write a guide titled “[Guide title]” for our Rails guide series, using Rails 8.
Audience: An experienced Rails developer who uses the framework regularly but rarely thinks about this particular mechanism. Assume practical Rails knowledge, but introduce the terminology needed to understand the topic.
Teaching approach:
* Build understanding before introducing problems or edge cases.
* Start with familiar behavior and explain the mechanism behind it.
* Introduce concepts in dependency order. Don’t explain something using terminology we haven’t covered yet.
* Use one small, consistent example throughout. Extend it as the explanation develops.
* Show concrete before-and-after behavior, then explain why it happens.
* Name the component responsible for each action. Distinguish what Rails configures from what Ruby or another library actually does.
* Connect each section to what the reader learned earlier.
* Give each section one central idea. After reading it, the reader should be able to answer its heading in plain language.
* Prefer better sequencing and clearer examples over adding detail.
* Introduce configuration after explaining the behavior it controls.
* Put exceptions and troubleshooting after the main mechanism is clear. State the exact conditions under which a failure occurs.
Style: Direct, conversational, and technically precise. Avoid unexplained jargon, unnecessary examples, and dramatic opening questions that imply more than the guide demonstrates.
Workflow:
1. Read docs/HOW_RAILS_LOADS_YOUR_CODE.md as the editorial reference.
2. Verify version-specific behavior against official documentation.
3. Write the complete draft to docs/[GUIDE_NAME].md, with source links.
4. Before presenting it, review every section for undefined terms, missing causal steps, and unnecessary detail.
5. Let me review and approve the Markdown before updating the website.
