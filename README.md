# .Net Webpack Config
Webpack configuration for .Net projects with multiple entries.
Forked from [create-react-app](https://github.com/facebookincubator/create-react-app "create-react-app") repository.

## Getting Started

### Installation
Clone repository in the root of the project.

run `yarn` to install pacakges

**You’ll need to have Node >= 5 on your machine.**  
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

#### NPM Task Runner
You can run the available tasks from Visual Studio with **NPM Task Runner extension**.  
The extension will use Yarn instead of NPM if a `yarn.lock` file exist in your root folder, so make sure you have it installed.

### Available tasks(recomended with [yarn](https://yarnpkg.com/en/))
**`yarn Start`** or **`npm start`**  
Runs the app in development mode.  
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
*When running these tasks assets are served from webpack-dev-server runtime and will not be available if the app is opened in the browser with any url except the logged one*

**`yarn build`** or **`npm run build`**  
Builds the app for production to the `Build` folder.  
The build is minified and the filenames include the hashes.


### Using configuration
This configuration is using a proxy on `locahost` to make the views served by IIS available on the port created by this configuration.

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

#### paths.js
In `config/paths.js` change the paths according to your project structure.
- `Scripts` - scripts src folder
- `Build` - folder name where bundles are stored, when changed, change it in `Global.asax` file where used with `AssetResolver` and in your `.csporj` file wildcard configuration
- `publicPath` is used to tell webpack where the app is served from. If your app is served from ex: `localhost/my-app`, the `publicPath` value must be `/my-app/`

#### providePlugins.js
Use `config/paths.js` to tell webpack which plugins/packages to be available globally   
docs: [provide plugin](https://webpack.js.org/plugins/provide-plugin/)
```javascript
module.exports = {
  $: 'jquery',
  jQuery: 'jquery',
  'window.jQuery': 'jquery',
};
```

#### addVendors.js
Use `config/addVendors.js` to create aliases to `import` or `require` certain module more easily or non npm/bower modules.
```javascript
config.addVendor('my-script', path.join(paths.appSrc, 'lib/my-script.js'));
```
See the [docs](https://webpack.js.org/configuration/resolve/#resolve-alias) for more info.


Read the official [loaders](https://webpack.js.org/loaders/) and [plugins](https://webpack.js.org/plugins/) documentation for further customisation.