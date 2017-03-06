using System.Web.Optimization;
using Backload.Bundles;
using System.Web.Caching;
using System.Web;
using Newtonsoft.Json;
using System.Diagnostics;
using System.IO;
using System.Collections;
using System.Collections.Generic;

namespace Northstar
{
    class AssetCollection : Dictionary<string, string>
    {
    }

    public class StaticAssetResolver
    {
        private string assetsJsonPath;
        private Cache cache;

        private const string CACHE_KEY = "assetsJsonDictionary";

        public StaticAssetResolver(string assetsJsonPath, Cache cache)
        {
            this.assetsJsonPath = assetsJsonPath;
            this.cache = cache;
        }

        public string GetActualPath(string assetPath)
        {
            var assets = cache.Get(CACHE_KEY) as AssetCollection;
            if (assets == null)
            {
                assets = GetAssetsFromFile();
                cache.Insert(CACHE_KEY, assets, new CacheDependency(assetsJsonPath));
                Trace.TraceInformation("Assets cache miss");
            } else
            {
                Trace.TraceInformation("Assets cache hit");
            }

            if (assets.ContainsKey(assetPath))
            {
                return VirtualPathUtility.ToAbsolute("~/" + assets[assetPath]);
            } else
            {
                return "";
            }
        }

        private AssetCollection GetAssetsFromFile()
        {
            return JsonConvert.DeserializeObject<AssetCollection>(File.ReadAllText(assetsJsonPath));
        }
    }

    public static class StaticAssets
    {
        private static StaticAssetResolver assetResolver;

        public static void Initialize(StaticAssetResolver staticAssetResolver)
        {
            if (assetResolver == null)
            {
                assetResolver = staticAssetResolver;
            }
        }

        public static HtmlString RenderScript(string path)
        {
            var actualPath = assetResolver.GetActualPath(path);
            return new HtmlString(string.IsNullOrEmpty(actualPath) ? $"<!-- No script with {path} name found. -->" : $"<script src=\"{ actualPath }\"></script>");
        }

        public static HtmlString RenderStyle(string path)
        {
            var actualPath = assetResolver.GetActualPath(path);
            return new HtmlString(string.IsNullOrEmpty(actualPath) ? $"<!-- No style with {path} name found. -->" : $"<link href=\"{ actualPath }\" rel=\"stylesheet\" />");
        }
    }
}
