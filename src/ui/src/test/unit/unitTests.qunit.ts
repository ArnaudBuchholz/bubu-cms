QUnit.config.autostart = false;

sap.ui.getCore().attachInit(() => sap.ui.require([
  'test/model/ListViewState'
], QUnit.start))
