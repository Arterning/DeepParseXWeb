import axios from 'axios';

// 系统配置基础接口
export interface ConfigSchemaBase {
  login_title: string;
  login_sub_title: string;
  footer: string;
  logo: string;
  system_title: string;
  system_comment: string;
  settings: Record<string, any>;
}

// 创建系统配置参数
export interface CreateConfigParam extends ConfigSchemaBase {}

// 更新系统配置参数
export interface UpdateConfigParam extends ConfigSchemaBase {}

// 获取系统配置详情
export interface GetConfigListDetails extends ConfigSchemaBase {
  id: number;
  created_time: string;
  updated_time?: string;
}

// 获取系统配置详情
export const getConfig = async (): Promise<GetConfigListDetails> => {
  const response = await axios.get('/api/v1/admin/config');
  return response.data;
};

// 创建系统配置
export const createConfig = async (params: CreateConfigParam): Promise<void> => {
  await axios.post('/api/v1/admin/config', params);
};

// 更新系统配置
export const updateConfig = async (pk: number, params: UpdateConfigParam): Promise<void> => {
  await axios.put(`/api/v1/admin/config/${pk}`, params);
};

// 批量删除系统配置
export const deleteConfig = async (pk: number[]): Promise<void> => {
  await axios.delete('/api/v1/admin/config', {
    params: {
      pk: pk
    }
  });
};