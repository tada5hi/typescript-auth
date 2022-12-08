import{_ as s,o as n,c as a,f as o}from"./app.5b1101e4.js";const A=JSON.parse('{"title":"Configuration","description":"","frontmatter":{},"headers":[],"relativePath":"packages/server-database/configuration.md"}'),p={name:"packages/server-database/configuration.md"},e=o(`<h1 id="configuration" tabindex="-1">Configuration <a class="header-anchor" href="#configuration" aria-hidden="true">#</a></h1><div class="warning custom-block"><p class="custom-block-title">Important</p><p>It is important to set the configuration, before using other parts of this packages.</p></div><p>To get an insight of a full list of options, which can be passed to the method, check out the <a href="./api-reference-config.html#config">API Reference</a>.</p><p>The <code>setConfigOptions</code> method, can be used to set a collection of options to the (existing) config instance. All other options inherit <strong>default</strong> values.</p><div class="language-typescript"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki"><code><span class="line"><span style="color:#89DDFF;">import</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">setConfigOptions</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">}</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">from</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">@authup/server-database</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#82AAFF;">setConfigOptions</span><span style="color:#A6ACCD;">(</span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#F07178;">permissions</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> [</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">resource_add</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">resource_drop</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">    ]</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#676E95;">/* ... */</span></span>
<span class="line"><span style="color:#89DDFF;">}</span><span style="color:#A6ACCD;">)</span></span>
<span class="line"></span></code></pre></div><p>The <code>readOptionsFromEnv</code> method, can be used to load option values from the environment.</p><div class="language-typescript"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki"><code><span class="line"><span style="color:#89DDFF;">import</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">setConfigOptions</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">readOptionsFromEnv</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">}</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">from</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">@authup/server-database</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#C792EA;">const</span><span style="color:#A6ACCD;"> env </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">readOptionsFromEnv</span><span style="color:#A6ACCD;">()</span><span style="color:#89DDFF;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#82AAFF;">setConfigOptions</span><span style="color:#A6ACCD;">(</span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">...</span><span style="color:#A6ACCD;">env</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#676E95;">/* ... */</span></span>
<span class="line"><span style="color:#89DDFF;">}</span><span style="color:#A6ACCD;">)</span></span>
<span class="line"></span></code></pre></div><p>The following environment variables are available:</p><ul><li><code>NODE_ENV</code>: <strong>string</strong></li><li><code>WRITABLE_DIRECTORY_PATH</code>: <strong>string</strong></li><li><code>ADMIN_USERNAME</code>: <strong>string</strong></li><li><code>ADMIN_PASSWORD</code>: <strong>string</strong></li><li><code>ROBOT_ENABLED</code>: <strong>boolean</strong></li><li><code>ROBOT_SECRET</code>: <strong>string</strong></li><li><code>PERMISSIONS</code>: <strong>string</strong></li></ul>`,9),l=[e];function t(c,r,i,D,y,F){return n(),a("div",null,l)}const d=s(p,[["render",t]]);export{A as __pageData,d as default};
