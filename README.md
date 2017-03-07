# .Net Webpack App
Webpack configuration for .Net projects with multiple entries.
Forked from [create-react-app](https://github.com/facebookincubator/create-react-app "create-react-app") repository.

## Getting Started

### Installation
Clone repository in the root of the project.

**You’ll need to have Node >= 4 on your machine.**  
**Use Node >= 6 and npm >= 3 for faster installation speed and better disk usage.**

### The `Build` folder and it's content is generated automaticly and should not be included in the project(using Visual Studio source explorer).
To make the folder and it's content available on dev/live environments use the wildcard configuracion in your .csproj file under the `<Project>` tag
```xml
<!-- ... -->
<Target Name="BeforeBuild">
  <ItemGroup>
    <Content Include="Build\**\*.*">
      <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
    </Content>
  </ItemGroup>
</Target>
<!-- ... -->
```

### Available tasks(recomended with yarn)
**`yarn Start`** or **`npm start`**  
Runs the app in development mode.  
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
*When running these tasks assets are served from webpack-dev-server runtime and will not be available if the app is opened in the browser with any url except the logged one*

**`yarn build`** or **`npm run build`**  
Builds the app for production to the `Build` folder.  
The build is minified and the filenames include the hashes.

#### NPM Task Runner
You can run the available tasks from Visual Studio with **NPM Task Runner extension**.  
The extension will use Yarn instead of NPM if a `yarn.lock` file exist in your root folder, so make sure you have it installed.

### Using configuration

#### AssetResolver
`App_Start/AssetResolver.cs` has static methods that will render the `<script>` and `<link>`

In your `Global.asax` initialize `AssertResolver` with the path to `asset-manifest.json` and an instance of `System.Web.Caching.Cache`

```csharp 
protected void Application_Start()
{
  // ...

  StaticAssets.Initialize(new StaticAssetResolver(Server.MapPath("~/Build/asset-manifest.json"), System.Web.HttpContext.Current.Cache));
}
```

`asset-manifest.json` is the file that maps the original filenames to the hashed filenames.

Use AssertResolver methods in a view ex(`_layout.cshtml`):
```csharp
@StaticAssets.RenderStyle("index.css")
<!-- ... -->
@StaticAssets.RenderScript("index.js")
```
And they will generate tags when run:
```
<link href="/Build/css/index.cf404633.css" rel="stylesheet" />
<!-- ... -->
<script src="/Build/js/index.58b06350.js"></script>
```
*`AssertResolver` uses `VirtualPathUtility.ToAbsolute` method to create absolute paths to assets so if your app runs under /my-app path, /my-app is added to the asset path.*  
*Change `WebpackBundler` namespace to your own.*

#### entries.js
Add your app entries in the exported object from `config/entries.js`
```javascript
module.exports = {
	index: './index.js',
};
```
The key(*index*) will be used to set the name for .js and .css assets.
ex: key = *main*, assets = *main.js* & *main.css*;

#### paths.js
In `config/paths.js` change the paths according to your project structure.
- `Scripts` - scripts src folder
- `Build` - folder name where bundles are stored, when changed, change it in `Global.asax` file where used with `AssetResolver`

#### providePlugins.js
Use `config/paths.js` to tell webpack which plugins/packages to be available globally   
docs: [provide plugin](https://webpack.github.io/docs/list-of-plugins.html#provideplugin)
ex: 
```javascript
module.exports = {
  $: 'jquery',
  jQuery: 'jquery',
  'window.jQuery': 'jquery',
};
```

#### addVendors.js
Use `config/addVendors.js` to make non AMD scripts available to be used as AMD
ex: `config.addVendor('my-script', path.join(paths.appSrc, 'lib/my-script.js'));`
use later: `import('my-script')`;