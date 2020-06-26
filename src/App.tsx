import React, { Fragment, useState, useEffect } from 'react';
import {
  JsonFormsDispatch,
  JsonFormsReduxContext
} from '@jsonforms/react';
import { Provider } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import './App.css';
import { Store } from 'redux';
import { get } from 'lodash';

// Signature
import SignatureCanvas from 'react-signature-canvas'


// qrcode
const QRCode = require('qrcode')

// pdf
const jsPDF = require("jspdf");
const html2canvas = require("html2canvas");


const styles = createStyles({
  container: {
    padding: '1em'
  },
  title: {
    textAlign: 'center',
    padding: '0.25em'
  },
  dataContent: {
    display: 'flex',
    justifyContent: 'center',
    borderRadius: '0.25em',
    backgroundColor: '#cecece'
  },
  demoform: {
    margin: 'auto',
    padding: '1rem'
  },
  textField: {
    marginLeft: '5em'
  }
});

export interface AppProps extends WithStyles<typeof styles> {
  store: Store;
}

const data = {};

const getDataAsStringFromStore = (store: Store) =>
  store
    ? JSON.stringify(
      get(store.getState(), ['jsonforms', 'core', 'data']),
      null,
      2
    )
    : '';

const getErrorAsStringFromStore = (store: Store) =>
  store
    ? JSON.stringify(
      get(store.getState(), ['jsonforms', 'core', 'errors']),
      null,
      2
    )
    : '';

const readImage = (file: File, img: any) => {
  // Check if the file is an image.
  if (file.type && file.type.indexOf('image') === -1) {
    console.log('File is not an image.', file.type, file);
    return;
  }

  const reader = new FileReader();
  reader.addEventListener('load', (event) => {
    if (event.target)
      img.src = event.target.result;
  });
  reader.readAsDataURL(file);
};

function renderQrcode(store: Store) {
  QRCode.toCanvas(document.getElementById('qrcode'),
    getDataAsStringFromStore(store)
  );
  console.log("store.errors", getErrorAsStringFromStore(store));
}
/**
 * Convert an html element in PDF.
 * 
 * @param document 
 */
function getPDF(pdf_element: any) {
  console.log("document", pdf_element);

  var HTML_Width = pdf_element.offsetWidth;
  var HTML_Height = pdf_element.offsetHeight;
  var top_left_margin = 15;
  var PDF_Width = HTML_Width + (top_left_margin * 2);
  var PDF_Height = (PDF_Width * 1.5) + (top_left_margin * 2);
  var canvas_image_width = HTML_Width;
  var canvas_image_height = HTML_Height;

  var totalPDFPages = Math.ceil(HTML_Height / PDF_Height) - 1;


  html2canvas(pdf_element, { allowTaint: true }).then(function (canvas: any) {
    canvas.getContext('2d');

    console.log(canvas.height + "  " + canvas.width);


    var imgData = canvas.toDataURL("image/png", 1.0);
    var pdf = new jsPDF('p', 'pt', [PDF_Width, PDF_Height]);
    pdf.addImage(imgData, 'png', top_left_margin, top_left_margin, canvas_image_width, canvas_image_height);


    for (var i = 1; i <= totalPDFPages; i++) {
      pdf.addPage(PDF_Width, PDF_Height);
      pdf.addImage(imgData, 'png', top_left_margin, -(PDF_Height * i) + (top_left_margin * 4), canvas_image_width, canvas_image_height);
    }

    pdf.save("tmp-jsonforms.pdf");
  });
};

const onFileSelector = (event: any) => {
  const fileList = event.target.files;
  console.log(fileList);
  readImage(fileList[0], document.getElementById("attachment-1"));
};

const App = ({ store, classes }: AppProps) => {
  const [displayDataAsString, setDisplayDataAsString] = useState('');
  const [standaloneData, setStandaloneData] = useState(data);
  const getMyPDF = () => { getPDF(document.getElementById('rootform')) };
  console.log(displayDataAsString);
  console.log(setStandaloneData);

  useEffect(() => {
    const updateStringData = () => {
      const stringData = getDataAsStringFromStore(store);
      setDisplayDataAsString(stringData);
    };
    store.subscribe(updateStringData);
    updateStringData();
  }, [store]);

  useEffect(() => {
    setDisplayDataAsString(JSON.stringify(standaloneData, null, 2));
  }, [standaloneData]);

  useEffect(() => {
    renderQrcode(store);
  });

  return (
    <Fragment>
      <div className='App'>
        <header className='App-header'>
          <h1 className='App-title'>Compila un form, allega i documenti e scarica il pdf</h1>
          <a href="?q=form-1/" >Anagrafe del comune di Bugliano</a><br />
          <a href="?q=form-2/" >Istituto Comprensivo Franti</a><br />
          <a href="?q=form-3/" >Ufficio elettorale comune di Bugliano</a><br />

          <input type="button" value="Download PDF." onClick={getMyPDF} />

        </header>
      </div>
      <form action="" method="POST" id="rootform">
        <Grid
          container
          justify={'center'}
          spacing={1}
          className={classes.container}
        >
          <Grid item sm={6}>
            <div className={classes.demoform} id='form'>
              {store ? (
                <Provider store={store}>
                  <JsonFormsReduxContext>
                    <JsonFormsDispatch />
                  </JsonFormsReduxContext>
                </Provider>
              ) : null}
              <SignatureCanvas
                canvasProps={{ width: 500, height: 200, className: 'sigCanvas', style: { borderBlockStyle: "solid" }, }} />
              <div className={classes.container}>
                <canvas id="qrcode" style={{ alignItems: 'center' }} />
              </div>

            </div>
          </Grid>
        </Grid>

        <div id="attachments">
          <img alt="Attachment 1" id="attachment-1" />
        </div>

      </form>
      Allega un file usando il bottone qui sotto.
      <input type="file" id="file-selector" multiple accept=".jpg, .jpeg, .png" onChange={onFileSelector} height="50px" />

    </Fragment>
  );

}; //App
/*
        <Grid item sm={6}>
          <Typography variant={'h3'} className={classes.title}>
            Bound data
          </Typography>
          <div className={classes.dataContent}>
            <pre id='boundData'>{displayDataAsString}</pre>
          </div>
        </Grid>

*/



export default withStyles(styles)(App);