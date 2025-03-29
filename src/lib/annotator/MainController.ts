/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 */
/*Ext.define('TextAnnotator.view.main.MainController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.main',


    control: {
        'repository repositorytree': {
            celldblclick: 'onRepositoryCellDblClick',
            cellcontextmenu: 'onRepositoryCellContext',
        },
        'annomain annosub tool': {
            click: 'onAnnoSubToolClick'
        },
        'pipeline gridpanel': {
            celldblclick: 'onPipelineCellDblClick'
        }
    },

    init: function () {
        let userURI = getCookie('user');
        let session = getCookie('session');

        if (userURI && session) {
            $.ajax({
                url: userURI,
                type: 'GET',
                dataType: "json",
                data: {
                    session: getCookie("session")
                },
                success: function (response) {
                    Ext.create('TextAnnotator.model.User', {
                        user: userURI,
                        userName: response.user.name,
                        fullName: response.user.description,
                        session: session,
                        preferences: []
                    });
                    //ANNO.openGetParams("id");

                },
                error: function (response) {
                    console.log(response);
                }
            });
        }
    },

    collapseStartPanel: function () {
        this.lookupReference('pnl_start').collapse();
    },

    onRepositoryCellDblClick: function ({}, {}, {}, record) {
        if (record.get('type') === 'file') {

            if (record.get('mimetype') === 'application/bson') {
                console.log("Load: " + record.getData().id);
                this.loadDocument(record.getData().id);
            } else {
                // load content / or select dokument
                console.log(record);

                let txtAreaInput = this.lookupReference('txtarea_input');

                console.log(txtAreaInput);
                $.ajax({
                    type: "GET",
                    dataType: "json",
                    url: ANNO.getAnnoServiceURL() + "/fetchTextContent",
                    data: {
                        url: record.get('uri').replace('document', 'file') + "?session=" + Ext.util.Cookies.get("session")
                    },
                    success: function (response) {
                        if (response.success) {
                            txtAreaInput.setValue(response.text);
                        }
                    },
                    error: function (response) {
                        console.log(response);
                    }
                });
            }
        }
    },

    onRepositoryCellContext: function ({}, id, cellindex, record, tr, rowindex, e) {

        e.stopEvent();

        console.log(record);
        console.log(record.get("id"));

        var reproMenue = new Ext.menu.Menu({
            items : [{
                text : "Calculate Verb List",
                handler: function(a){
                    ANNO.downloadFolderDocument(record.get('id'), "verblist_new");

                }
            }]
        });

        reproMenue.showAt(e.getX(), e.getY());

    },

    onPipelineCellDblClick: function ({}, {}, {}, record) {
        if (record.get('casDocument') !== null) {
            this.openDocument(record.get('casDocument'));
        }
    },

    loadDocument: function (docId) {
        ANNO.openCASDocument("" + docId)
    },

    closeAllAnnoSubs: function () {
        let annoMain = this.lookupReference('annomain');
        annoMain.removeAll();
        TextAnnotator.getApplication().getCASDocumentsStore().removeAll();
        this.getViewModel().set('annoSubs', []);
        this.lookupReference('pnl_start').expand();
    },

    closeAnnoSub: function (annoSub) {

            let that = this;

            Ext.MessageBox.show({
                title: 'Confirm',
                msg: 'You want to do save your annotations in this document before closing them?',
                buttons: Ext.MessageBox.YESNO,
                animateTarget: this,
                scope: this,
                fn: function(a){

                    let annoMain = that.lookupReference('annomain');
                    let casDocument = annoSub.getViewModel().get('casDocument');

                    if(a=="yes"){
                        ANNO.saveCASDocument(casDocument)
                    }
                    ANNO.closeCASDocument(casDocument);
                    TextAnnotator.getApplication().getCASDocumentsStore().remove(casDocument);
                    if (annoMain.query('annosub').length > 1) {
                        let index = annoMain.items.items.indexOf(annoSub);

                        if (index === 0) {
                            annoMain.remove(annoMain.items.items[1]);
                            console.log("e");
                        } else if (index === annoMain.items.items.length - 1) {
                            console.log("f");
                            annoMain.remove(annoMain.items.items[annoMain.items.items.length - 2]);
                        } else {
                            annoMain.remove(annoMain.items.items[index - 1]);
                            console.log("g");
                        }
                    }
                    annoMain.remove(annoSub);
                    if (annoMain.query('annosub').length <= 0) {
                        that.getViewModel().set('annoSubs', []);
                        that.lookupReference('pnl_start').expand();
                    }
                },
                icon: Ext.MessageBox["question"]
            });


    },

    onAnnoSubToolClick: function (cmp, {}, owner) {
        switch (cmp.name) {
            case 'tool_close':
                this.closeAnnoSub(owner);
                break;
        }
    },

    openDocument: function (doc) {
        TextAnnotator.getApplication().getCASDocumentsStore().add(doc);

        let annoMain = this.lookupReference('annomain');
        let annoSub = Ext.create('TextAnnotator.view.annotation.AnnoSub', {casDocument: doc});

        this.collapseStartPanel();

        let tmpCopy = this.getViewModel().get('annoSubs').slice();
        tmpCopy.push(annoSub);
        this.getViewModel().set('annoSubs', tmpCopy);
        if (this.getViewModel().get('hasAnnoSubs')) {
            annoMain.add({xtype: 'splitter'}, annoSub);
        } else {
            annoMain.add(annoSub);
        }

        let views = doc.get('views');

        if(views.in)
            ANNO.openView(doc, Ext.util.Cookies.get('user'));

        return annoSub.getId();
    },

    openSchema: function(doc) {
        //TextAnnotator.getApplication().getCASDocumentStore().add(doc);
        this.collapseStartPanel();
        let annoMain = this.lookupReference('annomain');
        let annoTypeBuilder = Ext.create('TextAnnotator.view.custom.AnnoTypeBuilder', { casDocument: doc });
        let tmpCopy = this.getViewModel().get('annoSubs').slice();
        tmpCopy.push(annoTypeBuilder);
        this.getViewModel().set('annoSubs', tmpCopy);
        annoMain.add({xtype: 'splitter'}, annoTypeBuilder);
        annoTypeBuilder.fireEvent('activate');
    },

    /*openAnnoTypeBuilder: function () {
        this.collapseStartPanel();
        let annoMain = this.lookupReference('annomain');
        let annoTypeBuilder = Ext.create('TextAnnotator.view.custom.AnnoTypeBuilder', {});
        let tmpCopy = this.getViewModel().get('annoSubs').slice();
        tmpCopy.push(annoTypeBuilder);
        this.getViewModel().set('annoSubs', tmpCopy);
        annoMain.add({xtype: 'splitter'}, annoTypeBuilder);
        annoTypeBuilder.fireEvent('activate');

    }*/

//});
