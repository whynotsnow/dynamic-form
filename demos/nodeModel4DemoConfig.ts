import type { FormConfig, FormValues } from '../packages/dynamic-form/src/exports';

const cityOptionsByProvince = {
  Shanghai: [{ label: '上海', value: 'Shanghai' }],
  Beijing: [{ label: '北京', value: 'Beijing' }],
  Guangdong: [
    { label: '深圳', value: 'Shenzhen' },
    { label: '广州', value: 'Guangzhou' }
  ]
};

const defaultCityByProvince = {
  Shanghai: 'Shanghai',
  Beijing: 'Beijing',
  Guangdong: 'Shenzhen'
};

const districtOptionsByCity = {
  Shanghai: [
    { label: '浦东新区', value: '浦东新区' },
    { label: '黄浦区', value: '黄浦区' },
    { label: '徐汇区', value: '徐汇区' }
  ],
  Beijing: [
    { label: '朝阳区', value: '朝阳区' },
    { label: '海淀区', value: '海淀区' },
    { label: '东城区', value: '东城区' }
  ],
  Shenzhen: [
    { label: '南山区', value: '南山区' },
    { label: '福田区', value: '福田区' },
    { label: '罗湖区', value: '罗湖区' }
  ],
  Guangzhou: [
    { label: '天河区', value: '天河区' },
    { label: '越秀区', value: '越秀区' },
    { label: '海珠区', value: '海珠区' }
  ]
};

const defaultDistrictByCity = {
  Shanghai: '浦东新区',
  Beijing: '朝阳区',
  Shenzhen: '南山区',
  Guangzhou: '天河区'
};

const addressUsageOptionsByCompanyType = {
  enterprise: [
    { label: '工商注册地址', value: '工商注册地址' },
    { label: '实际经营地址', value: '实际经营地址' }
  ],
  branch: [
    { label: '分支机构地址', value: '分支机构地址' },
    { label: '办事处地址', value: '办事处地址' }
  ],
  studio: [
    { label: '工作室地址', value: '工作室地址' },
    { label: '联系地址', value: '联系地址' }
  ]
};

const defaultAddressUsageByCompanyType = {
  enterprise: '工商注册地址',
  branch: '分支机构地址',
  studio: '工作室地址'
};

export const nodeModel4DemoConfig: FormConfig = {
  nodes: [
    {
      nodeType: 'field',
      id: 'isCompany',
      label: '企业客户',
      component: 'Switch',
      initialValue: true,
      dependents: ['companyInfo'],
      effect: (_changedValue, allValues) => ({
        groupsVisible: {
          companyInfo: allValues.isCompany === true
        }
      }),
      span: 8
    },
    {
      nodeType: 'container',
      id: 'companyInfo',
      title: '企业信息 / 普通 Container',
      name: 'company',
      initialVisible: true,
      children: [
        {
          nodeType: 'field',
          id: 'companyName',
          label: '企业名称',
          component: 'TextInput',
          initialValue: 'Snow Tech',
          span: 12,
          required: true
        },
        {
          nodeType: 'field',
          id: 'companyType',
          label: '企业类型',
          component: 'Select',
          initialValue: 'enterprise',
          dependents: ['addressUsage'],
          componentProps: {
            options: [
              { label: '企业法人', value: 'enterprise' },
              { label: '分支机构', value: 'branch' },
              { label: '个人工作室', value: 'studio' }
            ]
          },
          span: 12
        },
        {
          nodeType: 'container',
          id: 'companyAddress',
          title: '注册地址 / 嵌套 Container',
          name: 'address',
          children: [
            {
              nodeType: 'field',
              id: 'companyProvince',
              label: '省级行政区',
              component: 'Select',
              initialValue: 'Shanghai',
              dependents: ['companyCity'],
              componentProps: {
                options: [
                  { label: '上海市', value: 'Shanghai' },
                  { label: '北京市', value: 'Beijing' },
                  { label: '广东省', value: 'Guangdong' }
                ]
              },
              span: 8
            },
            {
              nodeType: 'field',
              id: 'companyCity',
              label: '城市',
              component: 'Select',
              initialValue: 'Shanghai',
              dependents: ['contacts', 'companyDistrict'],
              effect: (_changedValue, allValues, chain) => {
                const province = allValues.company?.address?.companyProvince as
                  | keyof typeof cityOptionsByProvince
                  | undefined;
                const cityFromProvince = province ? defaultCityByProvince[province] : undefined;
                const city =
                  chain.path.includes('companyProvince') || !allValues.company?.address?.companyCity
                    ? cityFromProvince
                    : allValues.company.address.companyCity;

                return {
                  value: city,
                  groupsVisible: {
                    contacts: city === 'Shanghai'
                  },
                  componentProps: {
                    options: province ? cityOptionsByProvince[province] : []
                  }
                };
              },
              componentProps: {
                options: cityOptionsByProvince.Shanghai
              },
              span: 8
            },
            {
              nodeType: 'field',
              id: 'companyDistrict',
              label: '区县',
              component: 'Select',
              initialValue: '浦东新区',
              effect: (_changedValue, allValues) => {
                const city = allValues.company?.address?.companyCity as
                  | keyof typeof districtOptionsByCity
                  | undefined;

                return {
                  value: city ? defaultDistrictByCity[city] : undefined,
                  componentProps: {
                    options: city ? districtOptionsByCity[city] : []
                  }
                };
              },
              componentProps: {
                options: districtOptionsByCity.Shanghai
              },
              span: 8
            },
            {
              nodeType: 'field',
              id: 'addressUsage',
              label: '地址用途',
              component: 'Select',
              initialValue: '工商注册地址',
              effect: (_changedValue, allValues) => {
                const companyType = allValues.company?.companyType as
                  | keyof typeof addressUsageOptionsByCompanyType
                  | undefined;

                return {
                  value: companyType ? defaultAddressUsageByCompanyType[companyType] : undefined,
                  componentProps: {
                    options: companyType ? addressUsageOptionsByCompanyType[companyType] : []
                  }
                };
              },
              componentProps: {
                options: addressUsageOptionsByCompanyType.enterprise
              },
              span: 8
            }
          ]
        }
      ]
    },
    {
      nodeType: 'container',
      id: 'contacts',
      title: '联系人 / Repeatable Container',
      name: 'contacts',
      repeatable: true,
      children: [
        {
          nodeType: 'field',
          id: 'contactName',
          label: '联系人姓名',
          component: 'TextInput',
          span: 12
        },
        {
          nodeType: 'field',
          id: 'contactPhone',
          label: '联系电话',
          component: 'TextInput',
          span: 12
        }
      ]
    }
  ]
};

export const nodeModel4DemoValues: FormValues = {
  contacts: [
    { contactName: 'Ada', contactPhone: '13800000001' },
    { contactName: 'Grace', contactPhone: '13800000002' }
  ]
};
