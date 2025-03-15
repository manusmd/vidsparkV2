import { Config } from "@remotion/cli/config";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";

Config.overrideWebpackConfig((currentConfiguration) => {
  return {
    ...currentConfiguration,
    resolve: {
      ...currentConfiguration.resolve,
      plugins: [
        ...(currentConfiguration.resolve?.plugins || []),
        new TsconfigPathsPlugin({
          configFile: "./tsconfig.json",
        }),
      ],
    },
  };
});
