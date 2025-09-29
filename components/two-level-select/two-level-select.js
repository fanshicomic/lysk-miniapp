Component({
  properties: {
    options: {
      type: Object,
      value: {
        '伙伴A': ['羁绊A1', '羁绊A2', '羁绊A3'],
        '伙伴B': ['羁绊B1', '羁绊B2'],
        '伙伴C': [],
        '伙伴D': ['羁绊D1'],
        '伙伴E': ['羁绊E1', '羁绊E2', '羁绊E3'],
      },
    },
    selected: {
      type: Object,
      value: {},
      observer: function (newVal) {
        if (newVal && newVal.topLevel) {
          this.setData({
            selectedTopLevel: newVal.topLevel,
            selectedSecondLevel: newVal.secondLevel || ''
          });
        }
      },
    },
    title: {
      type: String,
      value: ''
    }
  },
  data: {
    open: false,
    selectedTopLevel: '',
    selectedSecondLevel: '',
    displayOptions: [],
  },
  methods: {
    toggleSelect() {
      this.setData({
        open: !this.data.open,
      });
      if (this.data.open) {
        this.buildDisplayOptions();
      }
    },
    buildDisplayOptions(expandedTopLevel = '') {
      const { options } = this.data;
      const displayOptions = [];
      for (const topLevel in options) {
        displayOptions.push({ value: topLevel, level: 1, isExpanded: topLevel === expandedTopLevel });
        if (topLevel === expandedTopLevel && options[topLevel].length > 0) {
          options[topLevel].forEach(secondLevel => {
            displayOptions.push({ value: secondLevel, level: 2, topLevel: topLevel });
          });
        }
      }
      this.setData({ displayOptions });
    },
    selectOption(e) {
      const { value, level, isExpanded, topLevel } = e.currentTarget.dataset.item;

      if (level === 1) {
        const secondLevels = this.data.options[value];
        if (secondLevels && secondLevels.length > 0) {
          if (isExpanded) {
            this.buildDisplayOptions(); // Collapse
          } else {
            this.buildDisplayOptions(value); // Expand
          }
        } else {
          // Select level 1 item with no secondLevels
          this.setData({
            selectedTopLevel: value,
            selectedSecondLevel: '',
            open: false,
          });
          this.triggerEvent('select', { topLevel: value, secondLevel: '' });
        }
      } else if (level === 2) {
        // Select level 2 item
        this.setData({
          selectedTopLevel: topLevel,
          selectedSecondLevel: value,
          open: false,
        });
        this.triggerEvent('select', { topLevel: topLevel, secondLevel: value });
      }
    },
    closeAll() {
      this.setData({ open: false });
    },
    reset() {
      this.setData({
        selectedTopLevel: '',
        selectedSecondLevel: '',
      });
      this.buildDisplayOptions(); // Rebuild to ensure no expansion is left
    }
  },
  lifetimes: {
    attached: function () {
      this.buildDisplayOptions();
      if (this.data.selected && this.data.selected.topLevel) {
        this.setData({
          selectedTopLevel: this.data.selected.topLevel,
          selectedSecondLevel: this.data.selected.secondLevel || ''
        });
      }
    },
  },
});
