import React, { Component } from 'react';
import raf from 'raf';
import * as renderer from './Renderer'
 
export default class Canvas extends Component {

  state = {
  }
 
  componentDidMount() {
      const canvas = document.querySelector('#glcanvas');
      const gl = canvas.getContext('webgl', {premultipliedAlpha: false});

        // If we don't have a GL context, give up now
        if (!gl) {
          alert('Unable to initialize WebGL. Your browser or machine may not support it.');
          return;
        }

        this.rafHandle = raf(this.renderGlScene.bind(this, gl));

        this.programInfo = renderer.getTextureShaderProgram(gl);
      
        // Here's where we call the routine that builds all the
        // objects we'll be drawing.
        this.buffers = renderer.initBuffers(gl);
      
        this.bgTexture = renderer.loadTexture(gl, this.props.backgroundImage)
      
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    }

    componentDidUpdate(oldProps) {
      if (oldProps.eyeSrc != this.props.eyeSrc) {
        this.updateEyeTexture();
      }

      if (oldProps.backgroundImage != this.props.backgroundImage) {
        this.updateBackgroundTexture();
      }
    }

    updateBackgroundTexture() {
      const canvas = document.querySelector('#glcanvas');
      const gl = canvas.getContext('webgl');

      this.bgTexture = renderer.loadTexture(gl, this.props.backgroundImage)
    }

    updateEyeTexture() {
      var eyeSrc = this.props.eyeSrc;
      if (eyeSrc != null) {
        const canvas = document.querySelector('#glcanvas');
        const gl = canvas.getContext('webgl');

        this.eyeTexture = renderer.loadTexture(gl, eyeSrc, gl.LINEAR);
      } else {
        this.eyeTexture = null;
      }
    }
 
    renderGlScene(gl, programs) {
      renderer.drawStart(gl);
      renderer.drawScene(gl, this.programInfo, this.buffers, this.bgTexture, [1.0, 1.0, 1.0], [0, 0, 0], 0, [1.0, 1.0, 1.0]);

      if (this.eyeTexture) {
        var x = this.props.eyeXOffset;
        var y = this.props.eyeYOffset;

        var scaleX = this.props.eyeScaleFactor;
        var scaleY = this.props.eyeScaleFactor;
        if (this.props.eyeSrcAspectRatio < 1) {
          scaleX = scaleX * this.props.eyeSrcAspectRatio;
        } else if (this.props.eyeSrcAspectRatio > 1) {
          scaleY = scaleY * 1/this.props.eyeSrcAspectRatio;
        }

        var mirrorXLeft = this.props.mirrorLeftEye ? -1.0 : 1.0;
        var mirrorXRight = this.props.mirrorRightEye ? -1.0 : 1.0;

        var rotationLeft = this.props.mirrorLeftEye ? this.props.eyeRotation : -this.props.eyeRotation;
        var rotationRight = this.props.mirrorRightEye ? -this.props.eyeRotation : this.props.eyeRotation;

        renderer.drawScene(gl, this.programInfo, this.buffers, this.eyeTexture, [scaleX, scaleY, 1.0], [-x, y, 0], rotationLeft, [mirrorXLeft, 1.0, 1.0]);
        renderer.drawScene(gl, this.programInfo, this.buffers, this.eyeTexture, [scaleX, scaleY, 1.0], [x, y, 0], rotationRight, [mirrorXRight, 1.0, 1.0]);
      }

      this.rafHandle = raf(this.renderGlScene.bind(this, gl, programs));
  }
 
    render() {
        return (
          <canvas id="glcanvas" width="160" height="160"/>
        );
    }
}