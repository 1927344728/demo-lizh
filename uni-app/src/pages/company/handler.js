import { get as _get } from 'lodash';

const nodeWidth = 170;
const nodeHeight = 150;
export function shareholderDataHandler(data) {
  const _companyInfos = _get(data, 'companyInfos') || [];
  const _companyRelationList = _get(data, 'companyRelationList') || [];
  _companyInfos.forEach(e => {
    e.maxLevel = Math.max.apply(this, e.levels);
    e.shareholderIds = _companyRelationList
      .filter(r => r.id === e.id)
      .sort(
        (a, b) =>
          (b.shareRatio || '0').replace('%', '') -
          (a.shareRatio || '0').replace('%', '')
      )
      .map(e => e.parentId);
  });
  const levels = [...new Set(_companyInfos.map(e => e.maxLevel))].sort(
    (a, b) => a - b
  );

  const companyArrayByLevel = [];
  levels.forEach(l => {
    if (l === 0) {
      const companys = _companyInfos.filter(c => c.maxLevel === l);
      companyArrayByLevel[l] = companys;
      return;
    }
    companyArrayByLevel[l] = [];
    companyArrayByLevel[l - 1].forEach(prev => {
      prev.shareholderIds.forEach(id => {
        const item = _companyInfos.find(c => c.maxLevel === l && c.id === id);
        const isExist = companyArrayByLevel[l].some(c => c.id === id);
        if (item && !isExist) {
          companyArrayByLevel[l].push(item);
        }
      });
    });
  });
  companyArrayByLevel.reverse();

  const list = [];
  const countByLevel = [];
  companyArrayByLevel.forEach((arr, i) => {
    arr.forEach(e => {
      countByLevel[i] = countByLevel[i] ? countByLevel[i] + 1 : 1;
      const ralation = _companyRelationList.find(
        r => r.id === 0 && r.parentId === e.id
      );

      const id = e.id === 0 ? 'root' : e.id;
      const shape =
        id === 'root'
          ? 'company-root-node'
          : e.maxLevel === 1
          ? 'company-level1-node'
          : 'company-node';
      const startX =
        210 + window.innerWidth / 2 - (id === 'root' ? 220 : 136) / 2 - 24 / 2;
      const ports = [];
      if (i < companyArrayByLevel.length - 1) {
        ports.push({
          id: `${id}_bottom`,
          group: 'bottom',
        });
      }
      if (e.shareholderIds && e.shareholderIds.length) {
        ports.push({
          id: `${id}_top`,
          group: 'top',
        });
      }
      let label = e.name.substring(0, 8);
      let hasEllipsis = false;
      if (e.name.length > 8) {
        if (e.name.length <= 16) {
          label += `\n${e.name.substring(8, 16)}`;
        } else {
          label += `\n${e.name.substring(8, 14)}...`;
          hasEllipsis = true;
        }
      }
      if (ralation && ralation.shareRatio && e.maxLevel === 1) {
        label += `\n${ralation.shareRatio || ''}`;
      }

      const item = {
        id,
        shape,
        x:
          startX +
          nodeWidth * (countByLevel[i] - companyArrayByLevel[i].length / 2),
        y: 24 + nodeHeight * i,
        data: {
          name: e.name,
          comment: (e.comment || '').replace(/\n/g, '<br/>'),
          label,
          hasEllipsis,
        },
        ports,
      };
      list.push(item);
    });
  });

  _companyRelationList.forEach(e => {
    const id = e.id === 0 ? 'root' : e.id;
    const item = {
      id: `r${e.parentId}_${id}`,
      shape: 'company-edge',
      source: {
        cell: e.parentId,
        port: `${e.parentId}_bottom`,
      },
      target: {
        cell: id,
        port: `${id}_top`,
      },
      zIndex: 0,
    };
    list.push(item);
  });

  return list;
}
