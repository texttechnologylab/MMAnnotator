import { getCookie } from "../helpers"
import { CASDocument, ICASDocument } from "../../zustand/useDocument"
import { useContext } from "react"
import { WebSocketContext } from "@/components/wrappers/WebSocketProvider"

export const useANNO = () => {
  const annoservice = "textannotator.texttechnologylab.org"
  const annoServiceURL = "http://" + annoservice
  const resourceManagerURL = "https://resources.hucompute.org"
  const authorityManagerURL = "https://authority.hucompute.org"
  const servicesURL = "http://services.hucompute.org"
  const apiServices = "http://api.textannotator.texttechnologylab.org"

  const { annoSocketPromise } = useContext(WebSocketContext)

  function addCreateToQueue(
    doc: CASDocument,
    type: any,
    features: Record<string, any>
  ) {
    const batchIdentifier = "_b" + doc.cmdQueue.length + "_"

    //const typesystem = doc.typesystem

    //if (typesystem !== null && typeof typesystem[type] !== "undefined") {
    doc.cmdQueue.push({
      cmd: "create",
      data: { bid: batchIdentifier, _type: type, features: features }
    })
    // console.log(doc.get('cmdQueue'));
    //} else {
    //  console.log("Type " + type + " undefined in typesystem!")
    //}

    return batchIdentifier
  }

  function addRemoveToQueue(doc: CASDocument, addr: string) {
    const batchIdentifier = "_b" + doc.cmdQueue.length + "_"
    doc.cmdQueue.push({
      cmd: "remove",
      data: { bid: batchIdentifier, addr: "" + addr }
    })
    return batchIdentifier
  }

  function addRecommendationToQueue(
    doc: CASDocument,
    addr: string,
    decision: string
  ) {
    const batchIdentifier = "_b" + doc.cmdQueue.length + "_"
    doc.cmdQueue.push({
      cmd: "recommendation",
      data: {
        bid: batchIdentifier,
        addr: "" + addr,
        recommendation_decision: decision
      }
    })
    return batchIdentifier
  }

  function userPosition(doc: CASDocument, addr: string) {
    annoSocketPromise.then((webSocket) =>
      webSocket.send(
        JSON.stringify({
          cmd: "user_position",
          data: { casId: doc.id, _addr: addr }
        })
      )
    )
  }

  function setMeta(
    doc: CASDocument,
    view: any,
    tool: any,
    key: any,
    value: any
  ) {
    annoSocketPromise.then((webSocket) =>
      webSocket.send(
        JSON.stringify({
          cmd: "set_meta",
          data: {
            casId: doc.id,
            view: view,
            tool: tool,
            key: key,
            value: value
          }
        })
      )
    )
  }

  function addEditToQueue(doc: CASDocument, addr: number, features: any) {
    const batchIdentifier = "_b" + doc.cmdQueue.length + "_"
    doc.cmdQueue.push({
      cmd: "edit",
      data: { bid: batchIdentifier, addr: "" + addr, features: features }
    })
    return batchIdentifier
  }

  function addAppendArrayToQueue(
    doc: CASDocument,
    addr: string,
    featureName: any,
    featureAddr: string
  ) {
    const batchIdentifier = "_b" + doc.cmdQueue.length + "_"
    doc.cmdQueue.push({
      cmd: "append_array",
      data: {
        bid: batchIdentifier,
        addr: "" + addr,
        featureAddr: "" + featureAddr,
        featureName: featureName
      }
    })

    return batchIdentifier
  }

  function startQueue(doc: CASDocument) {
    if (doc.cmdQueue.length > 0 || !doc.isLocked) {
      doc.isLocked = true
      const bPrivate = doc.private
      annoSocketPromise.then((webSocket) => {
        const cmd = JSON.stringify({
          cmd: "work_batch",
          data: {
            casId: doc.id,
            toolName: doc.currentTool,
            view: doc.getCurrentView(),
            perspective: doc.perspective,
            queue: doc.cmdQueue,
            options: [{ privateSession: bPrivate }]
          }
        })
        webSocket.send(cmd)
        doc.cmdQueue = []
        doc.isLocked = false
      })
      //getRecommendation(doc, "NER", doc.getCurrentViewID(), doc.get('currentTool'));
    }
  }

  function getRecommendation(
    doc: CASDocument,
    type: any,
    view: any,
    tool: any
  ) {
    annoSocketPromise.then((webSocket) =>
      webSocket.send(
        JSON.stringify({
          cmd: "recommendation",
          data: { casId: doc.id, type: type, view: view, tool: tool }
        })
      )
    )
  }

  function createCASSchema(text: string) {
    annoSocketPromise.then((webSocket) =>
      webSocket.send(
        JSON.stringify({
          cmd: "create_schema",
          data: { name: text, parent: 27221 }
        })
      )
    )
  }

  function createCASInstanceFromXMI(xmi: string) {
    annoSocketPromise.then((webSocket) =>
      webSocket.send(JSON.stringify({ cmd: "create_cas", data: { xmi: xmi } }))
    )
  }

  function createCASInstanceFromXMIwithRepository(
    xmi: string,
    repository: any
  ) {
    annoSocketPromise.then((webSocket) =>
      webSocket.send(
        JSON.stringify({
          cmd: "create_db_cas",
          data: {
            xmi: xmi,
            parent: repository,
            description: "workshop_biodiversity_next"
          }
        })
      )
    )
  }

  function openCASSchema(id: any) {
    annoSocketPromise.then((webSocket) =>
      webSocket.send(
        JSON.stringify({ cmd: "open_schema", data: { casId: id } })
      )
    )
  }

  function openProject(id: string, view: string) {
    annoSocketPromise.then((webSocket) =>
      webSocket.send(
        JSON.stringify({
          cmd: "open_project",
          data: { projectId: id, viewName: view }
        })
      )
    )
  }

  function openProjectStats(id: string, view: string) {
    annoSocketPromise.then((webSocket) =>
      webSocket.send(
        JSON.stringify({
          cmd: "list_project_stats",
          data: { projectId: id, viewName: view }
        })
      )
    )
  }

  function openCASDocument(id: ICASDocument["id"]) {
    annoSocketPromise.then((webSocket) =>
      webSocket.send(JSON.stringify({ cmd: "open_cas", data: { casId: id } }))
    )
  }

  function closeCASDocument(doc: CASDocument) {
    annoSocketPromise.then((webSocket) =>
      webSocket.send(
        JSON.stringify({
          cmd: "close_cas",
          data: { casId: doc.id }
        })
      )
    )
  }

  async function saveCASDocument(doc: CASDocument) {
    annoSocketPromise.then((webSocket) =>
      webSocket.send(
        JSON.stringify({
          cmd: "save_cas",
          data: { casId: doc.id }
        })
      )
    )
  }

  function saveCASDocumentRepository(doc: CASDocument, repository: number) {
    annoSocketPromise.then((webSocket) =>
      webSocket.send(
        JSON.stringify({
          cmd: "create_db_cas",
          data: { casId: doc.id, parent: repository }
        })
      )
    )
  }

  function saveCASDocumentRepositoryRaw(
    name: string,
    description: string,
    repository: number,
    data: string
  ) {
    annoSocketPromise.then((webSocket) =>
      webSocket.send(
        JSON.stringify({
          cmd: "create_db_cas_fast",
          data: {
            name: name,
            description: description,
            parent: repository,
            xmi: data
          }
        })
      )
    )
  }
  /*
     function markAsFinishCAS(doc: Document, tool, view) {
         getAnnoSocket().then(webSocket => webSocket.send(JSON.stringify({
             cmd: 'finish_tool',
             data: { casId: doc.get('id'), toolName: tool, viewName: view }
         })));
     }
 
     function downloadCASDocument(doc: Document, format) {
         getAnnoSocket().then(webSocket => webSocket.send(JSON.stringify({
             cmd: 'download_cas',
             data: { casId: doc.get('id'), format: format }
         })));
     }
 
     function downloadSpecificDocument(doc: Document, type) {
         getAnnoSocket().then(webSocket => webSocket.send(JSON.stringify({
             cmd: 'download',
             data: { casId: doc.get('id'), type: type }
         })));
     }
 
     function downloadSpecificDocumentParam(doc: Document, type, annoClass) {
         console.log(doc);
         console.log(annoClass);
         getAnnoSocket().then(webSocket => webSocket.send(JSON.stringify({
             cmd: 'download',
             data: { casId: doc.get('id'), type: type, annoClass: annoClass }
         })));
 
     }
 
     function downloadSpecificDocumentByIdParam(id, type, annoClass) {
         getAnnoSocket().then(webSocket => webSocket.send(JSON.stringify({
             cmd: 'download',
             data: { casId: "" + id, type: type, annoClass: annoClass }
         })));
     }
 
     function downloadFolderDocument(id, type) {
         getAnnoSocket().then(webSocket => webSocket.send(JSON.stringify({
             cmd: 'download_folder',
             data: { casId: "" + id + "", type: type }
         })));
     }
 
     function downloadFolderDocumentAnnotation(id, type, pAnnoClass) {
         getAnnoSocket().then(webSocket => webSocket.send(JSON.stringify({
             cmd: 'download_folder',
             data: { casId: "" + id + "", type: type, annoClass: pAnnoClass }
         })));
     }
 
     function undo(doc: Document, view, tool) {
         console.log("UNDO");
         // if (!doc.get("isLocked")) {
         //     console.log("UNDO 2");
         //     doc.set("isLocked", true);
         getAnnoSocket().then(webSocket => webSocket.send(JSON.stringify({
             cmd: 'undo',
             data: { casId: doc.get('id'), view: view, toolName: tool }
         })));
         // }
     }
 
     function redo(doc: Document, view, tool) {
         // if (!doc.get("isLocked")) {
         //     doc.set("isLocked", true);
         getAnnoSocket().then(webSocket => webSocket.send(JSON.stringify({
             cmd: 'redo',
             data: { casId: doc.get('id'), view: view, toolName: tool }
         })));
         // }
     }*/

  function openTool(doc: CASDocument, toolName: string) {
    annoSocketPromise.then((webSocket) =>
      webSocket.send(
        JSON.stringify({
          cmd: "open_tool",
          data: {
            casId: doc.id,
            view: doc.getCurrentView(),
            toolName: toolName
          }
        })
      )
    )
  }

  function openToolSeg(
    doc: CASDocument,
    toolName: string,
    page: number = 0,
    pages: number = 10
  ) {
    annoSocketPromise.then((webSocket) =>
      webSocket.send(
        JSON.stringify({
          cmd: "open_tool_seg",
          data: {
            casId: doc.id,
            view: doc.getCurrentView(),
            page: page,
            pages: pages,
            toolName: toolName
          }
        })
      )
    )
  }

  function closeTool(doc: CASDocument, toolName: string) {
    annoSocketPromise.then((webSocket) =>
      webSocket.send(
        JSON.stringify({
          cmd: "close_tool",
          data: { casId: doc.id, toolName: toolName }
        })
      )
    )
  }
  /*
    function changeCompareView(doc: Document, viewName) {
        getAnnoSocket().then((webSocket) => webSocket.send(JSON.stringify({
            cmd: 'compare_view',
            data: { casId: doc.get('id'), viewName: viewName }
        })));
    }
 
    function getAnnoElementsByType(doc: Document, type, compare = false, recommendation = false) {
 
        if (recommendation) {
            return doc.get('recommendation')[type];
        }
        else {
            if (compare) {
                return doc.get('toolElementsCompare')[type];
            } else {
                return doc.get('toolElements')[type];
            }
 
        }
 
 
    }
 
    function getAnnoElementsByTypeAsList(doc: Document, type: string, compare = false, recommendation = false): any[] {
 
        let obj = null;
        if (recommendation) {
            obj = doc.get('recommendation')[type];
        }
        else {
            obj = compare ? doc.get('toolElementsCompare')[type] : doc.get('toolElements')[type];
        }
 
        if (typeof obj !== 'undefined') {
            return Object.values(obj);
        }
 
        return [];
    }
 
 
    function copyView(doc: Document, sSourceView, sTargetView, bLocal) {
        getAnnoSocket().then((webSocket) => webSocket.send(JSON.stringify({
            cmd: 'copy_view',
            data: { casId: doc.get('id'), sourceView: sSourceView, targetView: sTargetView, localView: bLocal }
        })));
    }
 
    function removeView(doc: Document, sView) {
        getAnnoSocket().then((webSocket) => webSocket.send(JSON.stringify({
            cmd: 'remove_view',
            data: { casId: doc.get('id'), view: sView }
        })));
    }
    */
  function openView(doc: CASDocument, pView: string) {
    annoSocketPromise.then((webSocket) =>
      webSocket.send(
        JSON.stringify({
          cmd: "open_view",
          data: { casId: doc.id, view: pView, force: true }
        })
      )
    )
    // getAnnoSocket().then((webSocket) => webSocket.send(JSON.stringify({cmd: 'open_view',
    //     data: {casId: doc.get('id'), 'view': "schnubbel", 'force':true}})));
  }

  function closeView(doc: CASDocument, pView: any) {
    annoSocketPromise.then((webSocket) =>
      webSocket.send(
        JSON.stringify({
          cmd: "close_view",
          data: { casId: doc.id, view: pView }
        })
      )
    )
  }
  /*
    function addViewIAA(doc: Document, pView, add) {
        getAnnoSocket().then((webSocket) => webSocket.send(JSON.stringify({
            cmd: 'add_iaa_view',
            data: { casId: doc.get('id'), 'view': pView, 'add': add }
        })));
    }

    function addViewGold(doc: Document, pView, add) {
        getAnnoSocket().then((webSocket) => webSocket.send(JSON.stringify({
            cmd: 'add_iaa_gold',
            data: { casId: doc.get('id'), 'view': pView, 'add': add }
        })));
    }

    function addClassIAA(doc: Document, pClass, add) {
        getAnnoSocket().then((webSocket) => webSocket.send(JSON.stringify({
            cmd: 'add_iaa_class',
            data: { casId: doc.get('id'), 'class': pClass, 'add': add }
        })));
    }

    function addClassIAAForce(doc: Document, pClass, add) {
        getAnnoSocket().then((webSocket) => webSocket.send(JSON.stringify({
            cmd: 'add_iaa_class',
            data: { casId: doc.get('id'), 'class': pClass, 'add': add, 'force': true }
        })));
    }

    function setPrivate(bPrivate) {
        getAnnoSocket().then((webSocket) => webSocket.send(JSON.stringify({
            cmd: 'private',
            data: { "private": bPrivate }
        })));
    }

    function getAnnoElement(doc: Document, addr: string, compare = false) {
        let element = compare ? doc.get('toolElementsCompare') : doc.get('toolElements');

        for (let typeKey in element) {
            if (!element.hasOwnProperty(typeKey)) continue;
            if (typeof element[typeKey][addr] !== 'undefined') {
                return element[typeKey][addr];
            }
        }
        return null;
    }

    function getAnnoElementsInRange(doc: Document, type: string, begin: number, end: number, allowOverlap = false, compare = false, recommendation = false) {

        let elements = null;

        if (recommendation) {
            elements = ANNO.getAnnoElementsByTypeAsList(doc, type, compare, true);
        }
        else {
            elements = ANNO.getAnnoElementsByTypeAsList(doc, type, compare);
        }

        let elementsInRange = [];
        for (let i = 0; i < elements.length; i++) {
            let eBegin = parseInt(elements[i]['features']['begin']);
            let eEnd = parseInt(elements[i]['features']['end']);
            if (eBegin >= begin && eEnd <= end) {
                elementsInRange.push(elements[i]);
            } else if (allowOverlap && (eBegin <= end && eEnd >= end || eBegin <= begin && eEnd >= begin)) {
                elementsInRange.push(elements[i]);
            }
        }
        return elementsInRange;
    }


    function getAnnoElementsInRangeAsList(doc: Document, begin: number, end: number, compare = false, recommendation = false) {
        let arr = [];

        let element = null;

        if (recommendation) {
            element = doc.get('recommendation');
        }
        else {
            element = compare ? doc.get('toolElementsCompare') : doc.get('toolElements');
        }

        for (let typeKey in element) {
            if (!element.hasOwnProperty(typeKey)) continue;
            let addresses = element[typeKey];
            for (let address in addresses) {
                if (!addresses.hasOwnProperty(address)) continue;
                if ('' + addresses[address]['features']['begin'] === '' + begin && '' + addresses[address]['features']['end'] === '' + end) {
                    arr.push(addresses[address]);
                }
            }
        }

        return arr;
    }

    function getTypeSystemTree() {
        let typeList = getTypeSystem();
        let typeObject =
        {
            root: {
                expanded: true,
                text: "",
                user: "",
                status: "",
                children: []
            }
        };

        for (let i = 0; i < typeList.length; i++) {
            typeObject[typeList[i].name] =
            {
                text: typeList[i].name,
                typeDescription: typeList[i],
                color: "FFFFFF"
            };
        }

        let first = true;
        while (typeList.length > 0) {
            let nonLeafs = new Set();
            for (let i = 0; i < typeList.length; i++) {
                let supertypeName = typeList[i].supertypeName === undefined ? 'root' : typeList[i].supertypeName;
                nonLeafs.add(supertypeName);
            }
            for (let i = typeList.length - 1; i >= 0; i--) {
                if (!nonLeafs.has(typeList[i].name)) {
                    let supertypeName = typeList[i].supertypeName === undefined ? 'root' : typeList[i].supertypeName;
                    if (first) {
                        typeObject[typeList[i].name].leaf = true;
                    }
                    if (typeObject[supertypeName].children === undefined) {
                        typeObject[supertypeName].children = [];
                    }
                    typeObject[supertypeName].children.push(typeObject[typeList[i].name]);
                    typeList.splice(i, 1);
                }
            }
            first = false;
        }

        return typeObject['root'];
    }

    function getRangeTypes() {
        let rangeTypeList =
            [
                "uima.cas.ArrayBase",
                "uima.cas.Boolean",
                "uima.cas.BooleanArray",
                "uima.cas.Byte",
                "uima.cas.ByteArray",
                "uima.cas.Double",
                "uima.cas.DoubleArray",
                "uima.cas.EmptyFSList",
                "uima.cas.EmptyFloatList",
                "uima.cas.EmptyIntegerList",
                "uima.cas.EmptyStringList",
                "uima.cas.FSArray",
                "uima.cas.FSList",
                "uima.cas.Float",
                "uima.cas.FloatArray",
                "uima.cas.FloatList",
                "uima.cas.Integer",
                "uima.cas.IntegerArray",
                "uima.cas.IntegerList",
                "uima.cas.ListBase",
                "uima.cas.Long",
                "uima.cas.LongArray",
                "uima.cas.NonEmptyFSList",
                "uima.cas.NonEmptyFloatList",
                "uima.cas.NonEmptyIntegerList",
                "uima.cas.NonEmptyStringList",
                "uima.cas.Short",
                "uima.cas.ShortArray",
                "uima.cas.Sofa",
                "uima.cas.String",
                "uima.cas.StringArray",
                "uima.cas.StringList"
            ];

        let typeList = getTypeSystem();
        for (let i = 0; i < typeList.length; i++) {
            rangeTypeList.push(typeList[i].name);
        }

        return rangeTypeList;
    }
    */
  function socketInitialized() {
    return annoSocketPromise !== null
  }

  function getAnnoServiceURL() {
    return annoServiceURL
  }

  function getResManagerURL() {
    return resourceManagerURL
  }

  function getAuthorityManagerURL() {
    return authorityManagerURL
  }

  function getServicesURL() {
    return servicesURL
  }

  function getAPIURL() {
    return apiServices
  }

  function getAnnoServiceSmall() {
    return annoservice
  }

  async function awaitSession() {
    await annoSocketPromise
    return
  }
  /*
    //taken from https://stackoverflow.com/questions/38224875/replacing-d3-transform-in-d3-v4
    function getTransformation(transform: string) {
        // Create a dummy g for calculation purposes only. This will never
        // be appended to the DOM and will be discarded once this function
        // returns.
        let g = document.createElementNS("http://www.w3.org/2000/svg", "g");

        // Set the transform attribute to the provided string value.
        g.setAttributeNS(null, "transform", transform);

        if (g.transform.baseVal.consolidate() !== null) {
            // consolidate the SVGTransformList containing all transformations
            // to a single SVGTransform of type SVG_TRANSFORM_MATRIX and get
            // its SVGMatrix.
            let matrix = g.transform.baseVal.consolidate()!.matrix;

            // Below calculations are taken and adapted from the private function
            // transform/decompose.js of D3's module d3-interpolate.
            let { a, b, c, d, e, f } = matrix;   // ES6, if this doesn't work, use below assignment
            // var a=matrix.a, b=matrix.b, c=matrix.c, d=matrix.d, e=matrix.e, f=matrix.f; // ES5
            let scaleX, scaleY, skewX;

            scaleX = Math.sqrt(a * a + b * b);
            a /= scaleX;
            b /= scaleX;

            skewX = a * c + b * d
            c -= a * skewX;
            d -= b * skewX;

            scaleY = Math.sqrt(c * c + d * d)
            c /= scaleY;
            d /= scaleY;
            skewX /= scaleY;

            if (a * d < b * c) {
                a = -a;
                b = -b;
                skewX = -skewX;
                scaleX = -scaleX;
            }
            return {
                translate: [e, f],
                rotate: Math.atan2(b, a) * 180 / Math.PI,
                skewX: Math.atan(skewX) * 180 / Math.PI,
                scale: [scaleX, scaleY]
            };
        } else {
            return {
                translate: [0, 0],
                rotate: Math.atan2(1, 1) * 180 / Math.PI,
                skewX: Math.atan(1) * 180 / Math.PI,
                scale: [1.0, 1.0]
            };

        }

    }

    function getAnnoTasks(tool: string, callback: CallbackFunction) {

        let check = resourceManagerURL + "/annotasks?tool=" + tool + "&session=" + getCookie('session');

        $.ajax({
            url: check,
            type: 'GET',
            dataType: "json",
            async: false,
            success: function (response) {
                if (response.success) {
                    callback(response.result);
                } else {
                    callback("unknown");
                }
            },
            error: function (response) {
                callback("unknown");
            }
        });

    }

    function getTTLabSynset(name: string, callback: CallbackFunction) {

        let url = "https://textimager.hucompute.org/VSD/getSenses?verb=";

        $.ajax({
            url: url + name,
            type: 'GET',
            dataType: "json",
            async: false,
            success: function (response) {
                callback(response);
            },
            error: function (response) {
                callback("unknown");
            }
        });

    }

    function getTTLabSynsetID(id: string, callback: CallbackFunction) {

        let url = "https://textimager.hucompute.org/VSD/sense/" + id;
        //FIXME:
        $.ajax({
            url: url + name,
            type: 'GET',
            dataType: "json",
            async: false,
            success: function (response) {
                callback(response);
            },
            error: function (response) {
                callback("unknown");
            }
        });

    }
    */
  function openGetParams(key: string) {
    const pID = getCookie("id")
    const pView = getCookie("view")
    switch (key) {
      case "id":
        if (pID != null) {
          //var p = Ext.create('Ext.ProgressBar', {
          //    width: 300
          //});

          // Wait for 5 seconds, then update the status el (progress bar will auto-reset)
          /*p.wait({
                        interval: 500, //bar will move fast!
                        duration: 50000,
                        increment: 15,
                        text: '... document ist loading',
                        scope: this,
                        fn: function () {
                            p.updateText('Done!');
                        }
                    });

                    let dialog = Ext.create({
                        name: 'waitingbox',
                        xtype: 'messagebox',
                        title: 'Please wait...',

                        width: 400,

                        html: '<p>... document is loading.</p>',

                        maximizable: false,
                        closable: false,

                        modal: true

                    });

                    dialog.show();*/
          openCASDocument("" + pID)
        }

        break

      case "view":
        if (pID != null && pView != null) {
          //TODO:let doc = TextAnnotator.getApplication().getCASDocumentsStore().getById(pID);
          //ANNO.openView(doc, pView);
        }
        break
      default:
        //let dialog = Ext.ComponentQuery.query('window[name=waitingbox]')[0];
        //if (dialog != null) {
        //    dialog.destroy();
        //}
        break
    }
  }

  /*function getMeanings(input: string, sourceLang: string, targetLang: string, callback: CallbackFunction) {
        let url = apiServices + "/meanings?input=" + input;
        if (sourceLang !== null) annoservice += "&sourceLang=" + sourceLang;
        if (targetLang !== null) annoservice += "&targetLang=" + targetLang;
        $.ajax({
            url: url,
            type: 'GET',
            contentType: "application/json",
            crossDomain: true,
            dataType: "json",
            async: true,
            success: function (response) {
                callback(response);
            },
            error: function (query) {
                callback("unknown");
            }
        });
    }

    function getPropBank(input: string, callback: CallbackFunction) {
        let url = apiServices + "/propbank?input=" + input;
        $.ajax({
            url: url,
            type: 'GET',
            contentType: "application/json",
            crossDomain: true,
            dataType: "json",
            async: false,
            success: function (response) {
                callback(response);
            },
            error: function (query) {
                console.log(query);
                callback("unknown");
            }
        });
    }

    function getEvalbu(input: string, callback: CallbackFunction) {
        let url = apiServices + "/evalbu?input=" + input;

        $.ajax({
            url: url,
            type: 'GET',
            contentType: "application/json",
            crossDomain: true,
            dataType: "json",
            async: true,
            success: function (response) {
                callback(response);
            },
            error: function (query) {
                console.log(query);
                callback("unknown");
            }
        });
    }

    function getEvalbuID(input: string, callback: CallbackFunction) {
        let url = apiServices + "/evalbu/" + input;
        console.log(url);
        $.ajax({
            url: url,
            type: 'GET',
            contentType: "application/json",
            crossDomain: true,
            dataType: "json",
            async: false,
            success: function (response) {
                callback(response);
            },
            error: function (query) {
                console.log(query);
                callback("unknown");
            }
        });
    }

    function annotatePerspective(doc: Document, vm, id) {

        let perspective = vm.get('perspective');

        if (perspective != null && perspective != "default") {
            ANNO.addCreateToQueue(doc, "org.texttechnologylab.annotation.AnnotationPerspective",
                {
                    name: perspective,
                    reference: id
                }
            );
        }

    }

    function getPerspectives(doc: Document) {

        let rArray = [];

        let list = getAnnoElementsByTypeAsList(doc, "org.texttechnologylab.annotation.AnnotationPerspective");

        if (list != null) {
            list.forEach(l => {
                if (!rArray.includes(l.features.name)) {
                    rArray.push(l.features.name);
                }
            });
        }

        return rArray;
    }
    */
  return {
    annoSocketPromise: annoSocketPromise,
    createNewAnnotationSchema: createCASSchema,
    openCASDSchema: openCASSchema,

    /*
        getAnnoElementsByType: getAnnoElementsByType,
        getAnnoElementsByTypeAsList: getAnnoElementsByTypeAsList,
        getAnnoElement: getAnnoElement,
        getAnnoElementsInRange: getAnnoElementsInRange,
        getAnnoElementsInRangeAsList: getAnnoElementsInRangeAsList,
        */
    addCreateToQueue: addCreateToQueue,
    addEditToQueue: addEditToQueue,
    addAppendArrayToQueue: addAppendArrayToQueue,
    addRemoveToQueue: addRemoveToQueue,
    addRecommendationToQueue: addRecommendationToQueue,
    startQueue: startQueue,

    createCASInstanceFromXMI: createCASInstanceFromXMI,
    createCASInstanceFromXMIRepository: createCASInstanceFromXMIwithRepository,

    openProject: openProject,
    openProjectStats: openProjectStats,
    openCASDocument: openCASDocument,
    closeCASDocument: closeCASDocument,
    saveCASDocument: saveCASDocument,
    saveCASDocumentRepo: saveCASDocumentRepository,
    saveCASDocumentRepoRaw: saveCASDocumentRepositoryRaw,
    /*    markAsFinish: markAsFinishCAS,
        downloadCASDocument: downloadCASDocument,
        downloadSpecificDocument: downloadSpecificDocument,
        downloadSpecificDocumentParam: downloadSpecificDocumentParam,
        downloadSpecificDocumentByIdParam: downloadSpecificDocumentByIdParam,
        downloadFolderDocument: downloadFolderDocument,
        downloadFolderDocumentAnnotation: downloadFolderDocumentAnnotation,
        undo: undo,
        redo: redo,*/
    userPosition: userPosition,

    /*copyView: copyView,
        removeView: removeView,*/
    openView: openView,
    closeView: closeView,
    /*addViewForIAA: addViewIAA,
        addViewForGold: addViewGold,
        addClassForIAA: addClassIAA,
        addClassForIAAForce: addClassIAAForce,*/
    setMeta: setMeta,
    openTool: openTool,
    openToolSeg: openToolSeg,
    closeTool: closeTool /*
        changeCompareView: changeCompareView,
        */,
    getAnnoServiceURL: getAnnoServiceURL,
    getResManagerURL: getResManagerURL,
    getAuthorityManagerURL: getAuthorityManagerURL,
    getServicesURL: getServicesURL,
    getAPIURL: getAPIURL,
    getAnnoServiceSmall: getAnnoServiceSmall,
    awaitSession: awaitSession,
    socketInitialized: socketInitialized,
    /*setPrivate: setPrivate,

        getTransformation: getTransformation,
        getUsername: getUsernameFromURI,
        getUsernameSync: getUsernameFromURIShort,
        */
    openGetParams: openGetParams,
    /*
        getAnnoTasks: getAnnoTasks,
        getTTLabSynset: getTTLabSynset,
        getTTLabSynsetID: getTTLabSynsetID,
        getMeanings: getMeanings,
        getPropBank: getPropBank,
        getEvalbu: getEvalbu,
        getEvalbuID: getEvalbuID,
        */
    getRecommendation: getRecommendation /*
        getPerspectives: getPerspectives,
        annotatePerspective: annotatePerspective*/
  }
}
