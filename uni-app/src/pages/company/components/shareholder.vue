<template>
  <div v-if="isShowChart" class="cv4i_shareholder">
    <h5>股东信息</h5>
    <p v-if="shareholderData" class="shareholder_frief">
      {{ shareholderData.shareholderBrief }}
    </p>
    <div class="shareholder_chart_wrapper">
      <div id="shareholderChart"></div>
      <div v-if="tooltips.visible" class="tooltips">
        <div v-html="tooltips.message"></div>
      </div>
      <div v-if="graph" class="shareholder_chart_icons">
        <i class="iconfont icon-reduce_circle" @click="graph.zoom(-0.1)"></i>
        <i class="iconfont icon-add_circle" @click="graph.zoom(0.1)"></i>
      </div>
    </div>
  </div>
</template>
<script>
// import Mock from '../mock.js'
import { get as _get, cloneDeep } from 'lodash';
import { Graph, ObjectExt, Path } from '@antv/x6';
import { URL_PARAM } from '@/utils/variables.js';
import { getCompanyHolderShare } from '@/api';
import { shareholderDataHandler } from '../handler.js';
export default {
  props: {
    companyLogo: String,
  },
  data() {
    return {
      isShowChart: true,
      shareholderData: null,
      tooltips: this.initTooltips(),
      graph: null,
      graphData: null,
    };
  },
  created() {
    this.init();
  },
  methods: {
    initTooltips() {
      return {
        visible: false,
        message: '',
      };
    },
    init() {
      return getCompanyHolderShare(Number(URL_PARAM.companyId)).then(
        ({ success, data, info }) => {
          if (!success) {
            this.isShowChart = false;
            return;
          }
          this.shareholderData = data;
          this.initChart(data);
        }
      );
    },
    initChart(data) {
      const self = this;
      const graphData = shareholderDataHandler(data);
      self.graphData = graphData;
      const basicNode = {
        inherit: 'rect',
        width: 136,
        height: 50,
        markup: [
          {
            tagName: 'rect',
            selector: 'body',
          },
          {
            tagName: 'rect',
            selector: 'leftSide',
          },
          {
            tagName: 'rect',
            selector: 'leftSide2',
          },
          {
            tagName: 'text',
            selector: 'label',
          },
        ],
        attrs: {
          body: {
            strokeWidth: 0,
            fill: '#fff',
            rx: 8,
            ry: 8,
          },
          leftSide: {
            ref: 'body',
            width: 10,
            refHeight: '100%',
            refX: 0,
            strokeWidth: 0,
            fill: '#90deb5',
            rx: 8,
            ry: 8,
          },
          leftSide2: {
            ref: 'body',
            width: 5,
            refHeight: '100%',
            refX: 5,
            strokeWidth: 0,
            fill: '#90deb5',
          },
          label: {
            ref: 'body',
            fontSize: 12,
            lineHeight: 16,
            fill: '#333333',
            refX: 20,
            yAlign: 'middle',
            textAnchor: 'start',
          },
        },
        propHooks(meta) {
          const _label = _get(meta, 'data.label');
          if (!_label) {
            return meta;
          }
          ObjectExt.setByPath(meta, `attrs/label/text`, _label);
          return meta;
        },
        ports: {
          groups: {
            top: {
              position: 'top',
              attrs: {
                circle: {
                  r: 0,
                  magnet: true,
                  strokeWidth: 0,
                },
              },
            },
            bottom: {
              position: 'bottom',
              attrs: {
                circle: {
                  r: 4,
                  magnet: true,
                  strokeWidth: 1,
                  stroke: '#C2C8D5',
                  fill: '#fff',
                },
              },
            },
          },
        },
      };

      const companyRootNode = cloneDeep(basicNode);
      companyRootNode.width = 220;
      companyRootNode.height = 74;
      companyRootNode.markup.push({
        tagName: 'rect',
        selector: 'imageWrapper',
      });
      companyRootNode.markup.push({
        tagName: 'image',
        selector: 'image',
      });
      companyRootNode.attrs.leftSide.fill = '#0A64FE';
      companyRootNode.attrs.leftSide2.fill = '#0A64FE';
      companyRootNode.attrs.imageWrapper = {
        x: 20,
        y: 12,
        width: 76,
        height: 50,
        stroke: '#E6E6E6',
        strokeWidth: 1,
      };
      companyRootNode.attrs.image = {
        x: 28,
        y: 20,
        width: 60,
        height: 34,
        stroke: '#E6E6E6',
        strokeWidth: 1,
        opacity: 0.7,
        xlinkHref: self.companyLogo,
      };
      companyRootNode.attrs.label.refX = 106;
      Graph.registerNode('company-root-node', companyRootNode, true);

      const companyLevel1Node = cloneDeep(basicNode);
      companyLevel1Node.height = 70;
      Graph.registerNode('company-level1-node', companyLevel1Node, true);

      const companyNode = cloneDeep(basicNode);
      Graph.registerNode('company-node', companyNode, true);

      Graph.registerEdge(
        'company-edge',
        {
          inherit: 'edge',
          attrs: {
            line: {
              stroke: '#C2C8D5',
              strokeWidth: 1,
            },
          },
        },
        true
      );
      Graph.registerConnector(
        'company-connector',
        (s, e) => {
          const offset = 4;
          const deltaY = Math.abs(e.y - s.y);
          const control = Math.floor((deltaY / 3) * 2);

          const v1 = { x: s.x, y: s.y + offset + control };
          const v2 = { x: e.x, y: e.y - offset - control };

          return Path.normalize(
            `M ${s.x} ${s.y}
          L ${s.x} ${s.y + offset}
          C ${v1.x} ${v1.y} ${v2.x} ${v2.y} ${e.x} ${e.y - offset}
          L ${e.x} ${e.y}
          `
          );
        },
        true
      );

      // 在 2.x 版本中已经将画布设置为无法双指缩放
      // https://github.com/antvis/X6/issues/2813
      const graph = new Graph({
        container: document.getElementById('shareholderChart'),
        background: {
          color: '#deeaff',
        },
        interacting: false,
        resizing: true,
        scaling: {
          min: 0.1,
          max: 2,
        },
        mousewheel: {
          enabled: true,
          modifiers: 'ctrl',
          factor: 1.1,
          maxScale: 2,
          minScale: 0.1,
        },
        panning: true,
        connecting: {
          snap: true,
          allowBlank: false,
          allowLoop: false,
          highlight: true,
          connector: 'company-connector',
          connectionPoint: 'anchor',
          anchor: 'center',
          validateMagnet({ magnet }) {
            return magnet.getAttribute('port-group') !== 'bottom';
          },
          createEdge() {
            return graph.createEdge({
              shape: 'company-edge',
              attrs: {
                line: {
                  strokeDasharray: '5 5',
                },
              },
              zIndex: -1,
            });
          },
        },
      });

      const cells = [];
      graphData.forEach(item => {
        if (
          ['company-root-node', 'company-level1-node', 'company-node'].includes(
            item.shape
          )
        ) {
          cells.push(graph.createNode(item));
          return;
        }
        cells.push(graph.createEdge(item));
      });
      graph.on('node:click', ({ view }) => {
        const hasEllipsis = _get(view, 'cell.store.data.data.hasEllipsis');
        const name = _get(view, 'cell.store.data.data.name');
        const comment = _get(view, 'cell.store.data.data.comment');

        const message = comment || (hasEllipsis ? name : '');
        if (message) {
          self.tooltips = {
            visible: true,
            message,
          };
          setTimeout(() => {
            self.tooltips = self.initTooltips();
          }, 3000);
          return;
        }
        self.tooltips = self.initTooltips();
      });
      graph.on('blank:click', () => {
        self.tooltips = self.initTooltips();
      });
      graph.resetCells(cells);
      graph.centerContent();
      graph.zoomToFit({
        padding: 10,
        maxScale: 1,
      });
      this.graph = graph;
    },
  },
};
</script>
<style>
@import './shareholder.css';
</style>
