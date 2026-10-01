using System;
using Newtonsoft.Json.Linq;

public class CPHInline
{
    private const string ConfigurationKey = "rts.overlay.configuration";
    private const string EventName = "RTS - Overlay - Configuration";

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

        if (string.IsNullOrWhiteSpace(raw))
            return CreateDefaults();

        try
        {
            return JObject.Parse(raw);
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
            ["version"] = 1,
            ["overlay"] = new JObject(),
            ["extensions"] = new JObject()
        };
    }
}
