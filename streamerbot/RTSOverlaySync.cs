using System;
using Newtonsoft.Json.Linq;

public class CPHInline
{
    private const string ConfigurationKey = "rts-overlay";
    private const string LegacyKey = "rts.overlay.configuration";
    private const string EventName = "RTS - Overlay";

    public bool Execute()
    {
        var operation = "get";

        if (CPH.TryGetArg("rtsOverlayOperation", out string requestedOperation) &&
            !string.IsNullOrWhiteSpace(requestedOperation))
            operation = requestedOperation;

        if (string.Equals(operation, "save", StringComparison.OrdinalIgnoreCase))
            return SaveConfiguration();

        return GetConfiguration();
    }

    public bool GetConfiguration()
    {
        var configuration = ReadConfiguration();

        CPH.SetArgument(
            "rtsOverlayConfiguration",
            configuration.ToString(Newtonsoft.Json.Formatting.None));

        CPH.TriggerEvent(EventName, true);
        return true;
    }

    public bool SaveConfiguration()
    {
        if (!CPH.TryGetArg("rtsOverlayConfiguration", out string raw) ||
            string.IsNullOrWhiteSpace(raw))
            return false;

        try
        {
            var configuration = JObject.Parse(raw);

            CPH.SetGlobalVar(
                ConfigurationKey,
                configuration.ToString(Newtonsoft.Json.Formatting.None),
                true);

            CPH.SetArgument(
                "rtsOverlayConfiguration",
                configuration.ToString(Newtonsoft.Json.Formatting.None));

            CPH.TriggerEvent(EventName, true);
            return true;
        }
        catch (Exception ex)
        {
            CPH.LogWarn(
                "RTS Overlay: configuration save failed: " + ex.Message);
            return false;
        }
    }

    private JObject ReadConfiguration()
    {
        var raw = CPH.GetGlobalVar<string>(ConfigurationKey, true);
        var legacy = false;

        if (string.IsNullOrWhiteSpace(raw))
        {
            raw = CPH.GetGlobalVar<string>(LegacyKey, true);
            legacy = !string.IsNullOrWhiteSpace(raw);
        }

        if (string.IsNullOrWhiteSpace(raw))
            return CreateDefaults();

        try
        {
            var configuration = JObject.Parse(raw);

            if (configuration["overlay"] is JObject overlay)
            {
                if (legacy)
                    CPH.SetGlobalVar(
                        ConfigurationKey,
                        overlay.ToString(Newtonsoft.Json.Formatting.None),
                        true);

                return overlay;
            }

            return configuration;
        }
        catch
        {
            CPH.LogWarn(
                "RTS Overlay: stored configuration was invalid; using defaults.");
            return CreateDefaults();
        }
    }

    private JObject CreateDefaults()
    {
        return new JObject
        {
            ["messaging"] = new JObject(),
            ["panels"] = new JObject(),
            ["positioning"] = new JObject(),
            ["animation"] = new JObject()
        };
    }
}
