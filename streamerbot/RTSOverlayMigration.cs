using Newtonsoft.Json.Linq;

public class CPHInline
{
    private const string TargetKey = "rts.overlay.configuration";

    public bool Execute()
    {
        var configuration = new JObject
        {
            ["version"] = 1,
            ["overlay"] = new JObject(),
            ["extensions"] = new JObject()
        };

        AddGlobal(configuration["overlay"] as JObject, "player",
            "rts.actionreplay.config.player");

        AddGlobal(configuration["overlay"] as JObject, "panel",
            "rts.actionreplay.config.panel");

        AddGlobal(configuration["overlay"] as JObject, "message",
            "rts.actionreplay.config.message");

        AddGlobal(configuration["overlay"] as JObject, "clapperboard",
            "rts.actionreplay.config.clapper");

        AddGlobal(configuration["overlay"] as JObject, "presets",
            "rts.actionreplay.config.presets");

        CPH.SetGlobalVar(
            TargetKey,
            configuration.ToString(Newtonsoft.Json.Formatting.None),
            true);

        CPH.SetArgument(
            "rtsOverlayConfiguration",
            configuration.ToString(Newtonsoft.Json.Formatting.None));

        CPH.LogInfo("RTS Overlay: migrated Action Replay configuration.");
        return true;
    }

    private void AddGlobal(JObject target, string name, string key)
    {
        var raw = CPH.GetGlobalVar<string>(key, true);

        if (string.IsNullOrWhiteSpace(raw))
        {
            CPH.LogWarn("RTS Overlay: source global missing: " + key);
            return;
        }

        try
        {
            target[name] = JObject.Parse(raw);
        }
        catch
        {
            CPH.LogWarn("RTS Overlay: source global invalid: " + key);
        }
    }
}
