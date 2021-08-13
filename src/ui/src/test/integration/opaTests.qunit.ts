QUnit.config.autostart = false;

sap.ui.getCore().attachInit(async () => {
	const pages = [
		"Main"

	].map((name: string) => `beaver/poc/node/ui/test/integration/pages/${name}`);

	const allJourneys = await fetch('AllJourneys.json');
	const journeyNames: string[] = await allJourneys.json();
	const [, selectedJourneyName] = /journey=([^&]*)/.exec(location.search) ?? [];
	const journeys: string[] = journeyNames
		.filter((name: string) => name === (selectedJourneyName ?? name))
		.map((name: string) => `beaver/poc/node/ui/test/integration/${name}`);

	sap.ui.require([
		"sap/ui/test/Opa5",
		"Startup",
		...pages,
		...journeys
	], (Opa5: any, Startup: any) => {
		
		Opa5.extendConfig({
			arrangements : new Startup(),
			viewNamespace : "bubu-cms.",
			pollingInterval: 50,
			autoWait: true,
			appParams: {
				"sap-ui-animation": false,
				"sap-ui-language": "EN"
			}
		});

		QUnit.start();
	});

});
