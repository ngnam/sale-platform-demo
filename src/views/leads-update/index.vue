<template>
  <router-view v-slot="{ route }">
    <div class="node-container">
      <h2 class="nc_title font18">Chỉnh sửa khách hàng</h2>

      <a-steps v-model:current="currentStep" class="mb20" @change="handleStepChange">
        <a-step title="Loại khách hàng" />
        <a-step title="Chỉnh sửa thông tin" />
        <a-step title="Xác nhận" :disabled="!isStep3Enabled" />
      </a-steps>

      <!-- Step 1 -->
      <div v-if="currentStep === 0">
        <a-card title="Loại khách hàng">
          <a-radio-group v-model:value="form.isOrganization" :disabled="true">
            <a-radio :value="false">Cá nhân</a-radio>
            <a-radio :value="true">Tổ chức</a-radio>
          </a-radio-group>
        </a-card>
        <div class="mt20">
          <a-button type="primary" @click="next">Tiếp tục</a-button>
        </div>
      </div>

      <!-- Step 2 -->
      <div v-if="currentStep === 1">
        <a-spin :spinning="loading">
          <a-form ref="formRef" :model="form" :rules="rulesCombined" layout="vertical" @finish="onFinish">
            <template v-if="!form.isOrganization">
              <!-- Cá nhân -->
              <a-collapse v-model:activeKey="personalActiveKeys">
                <!-- Basic -->
                <a-collapse-panel key="basic" header="Thông tin cơ bản">
                  <div class="panel-body">
                    <a-row :gutter="16">
                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Họ và tên" name="fullName">
                          <a-input :name="'fullName'" :data-name="'fullName'" :ref="el => setFieldRef('fullName', el)"
                            v-model:value="form.fullName" style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Tên (Given names)" name="givenNames">
                          <a-input name="givenNames" data-name="givenNames" :ref="el => setFieldRef('givenNames', el)"
                            v-model:value="form.givenNames" style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Họ và tên đệm (Family)" name="familyName">
                          <a-input name="familyName" data-name="familyName" :ref="el => setFieldRef('familyName', el)"
                            v-model:value="form.familyName" style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Giới tính" name="gender">
                          <a-select name="gender" data-name="gender" :ref="el => setFieldRef('gender', el)"
                            v-model:value="form.gender" allowClear style="width:100%">
                            <a-select-option value="Male">Nam</a-select-option>
                            <a-select-option value="Female">Nữ</a-select-option>
                          </a-select>
                        </a-form-item>
                      </a-col>
                    </a-row>

                    <a-row :gutter="16" class="mt8">
                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Ngày sinh" name="dob">
                          <a-date-picker name="dob" data-name="dob" :ref="el => setFieldRef('dob', el)"
                            v-model:value="form.dob" style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Tên khác" name="otherNames">
                          <a-input name="otherNames" data-name="otherNames" :ref="el => setFieldRef('otherNames', el)"
                            v-model:value="form.otherNames" style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Nơi làm việc" name="employerName">
                          <a-input name="employerName" data-name="employerName"
                            :ref="el => setFieldRef('employerName', el)" v-model:value="form.employerName"
                            style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Nơi sinh" name="birthCountry">
                          <a-input name="birthCountry" data-name="birthCountry"
                            :ref="el => setFieldRef('birthCountry', el)" v-model:value="form.birthCountry"
                            style="width:100%" />
                        </a-form-item>
                      </a-col>
                    </a-row>

                    <a-row :gutter="16" class="mt8">
                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Loại giấy tờ" name="idType">
                          <a-input name="idType" data-name="idType" :ref="el => setFieldRef('idType', el)"
                            v-model:value="form.idType" style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Số giấy tờ" name="idNumber">
                          <a-input name="idNumber" data-name="idNumber" :ref="el => setFieldRef('idNumber', el)"
                            v-model:value="form.idNumber" style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Ngày cấp" name="idIssueDate">
                          <a-date-picker name="idIssueDate" data-name="idIssueDate"
                            :ref="el => setFieldRef('idIssueDate', el)" v-model:value="form.idIssueDate"
                            style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Ngày hết hạn" name="idExpiryDate">
                          <a-date-picker name="idExpiryDate" data-name="idExpiryDate"
                            :ref="el => setFieldRef('idExpiryDate', el)" v-model:value="form.idExpiryDate"
                            style="width:100%" />
                        </a-form-item>
                      </a-col>
                    </a-row>
                  </div>
                </a-collapse-panel>

                <!-- Contact -->
                <a-collapse-panel key="contact" header="Thông tin liên hệ">
                  <div class="panel-body">
                    <a-row :gutter="16">
                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Số điện thoại di động" name="mobilePhone">
                          <a-input name="mobilePhone" data-name="mobilePhone" :ref="el => setFieldRef('mobilePhone', el)"
                            v-model:value="form.mobilePhone" style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Số điện thoại khác" name="otherPhone">
                          <a-input name="otherPhone" data-name="otherPhone" :ref="el => setFieldRef('otherPhone', el)"
                            v-model:value="form.otherPhone" style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Email" name="email">
                          <a-input name="email" data-name="email" :ref="el => setFieldRef('email', el)"
                            v-model:value="form.email" style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Quốc tịch" name="nationality">
                          <a-input name="nationality" data-name="nationality" :ref="el => setFieldRef('nationality', el)"
                            v-model:value="form.nationality" style="width:100%" />
                        </a-form-item>
                      </a-col>
                    </a-row>
                  </div>
                </a-collapse-panel>

                <!-- Addresses -->
                <a-collapse-panel key="addresses" header="Địa chỉ">
                  <div class="panel-body">
                    <a-row :gutter="16">

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Loại địa chỉ thường trú" name="permanentAddressType">
                          <a-select name="permanentAddressType" data-name="permanentAddressType"
                            :ref="el => setFieldRef('permanentAddressType', el)" v-model:value="form.permanentAddressType"
                            allowClear style="width:100%">
                            <a-select-option value="Company">Cơ quan</a-select-option>
                            <a-select-option value="Home">Nhà ở</a-select-option>
                          </a-select>
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Địa chỉ thường trú" name="permanentAddressLine">
                          <a-input name="permanentAddressLine" data-name="permanentAddressLine"
                            :ref="el => setFieldRef('permanentAddressLine', el)" v-model:value="form.permanentAddressLine"
                            style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Quốc gia (thường trú)" name="permanentCountry">
                          <a-input name="permanentCountry" data-name="permanentCountry"
                            :ref="el => setFieldRef('permanentCountry', el)" v-model:value="form.permanentCountry"
                            style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Tỉnh/Thành (thường thường trú)" name="permanentProvince">
                          <a-input name="permanentProvince" data-name="permanentProvince"
                            :ref="el => setFieldRef('permanentProvince', el)" v-model:value="form.permanentProvince"
                            style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Quận/Huyện (thường trú)" name="permanentDistrict">
                          <a-input name="permanentDistrict" data-name="permanentDistrict"
                            :ref="el => setFieldRef('permanentDistrict', el)" v-model:value="form.permanentDistrict"
                            style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Phường/Xã (thường trú)" name="permanentWard">
                          <a-input name="permanentWard" data-name="permanentWard"
                            :ref="el => setFieldRef('permanentWard', el)" v-model:value="form.permanentWard"
                            style="width:100%" />
                        </a-form-item>
                      </a-col>
                    </a-row>

                    <a-row :gutter="16" class="mt8">
                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item>
                          <a-checkbox name="isCurrentAddressSameAsPermanent" data-name="isCurrentAddressSameAsPermanent"
                            :ref="el => setFieldRef('isCurrentAddressSameAsPermanent', el)"
                            v-model:checked="form.isCurrentAddressSameAsPermanent">
                            Địa chỉ hiện tại giống địa chỉ thường trú
                          </a-checkbox>
                        </a-form-item>
                      </a-col>
                    </a-row>

                    <a-row :gutter="16" class="mt8">

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item v-if="!form.isCurrentAddressSameAsPermanent" label="Loại địa chỉ hiện tại"
                          name="currentAddressType">
                          <a-select name="currentAddressType" data-name="currentAddressType"
                            :ref="el => setFieldRef('currentAddressType', el)" v-model:value="form.currentAddressType"
                            allowClear style="width:100%">
                            <a-select-option value="company">Cơ quan</a-select-option>
                            <a-select-option value="home">Nhà ở</a-select-option>
                          </a-select>
                        </a-form-item>
                      </a-col>

                      <a-col v-if="!form.isCurrentAddressSameAsPermanent" :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Địa chỉ hiện tại" name="currentAddressLine">
                          <a-input name="currentAddressLine" data-name="currentAddressLine"
                            :ref="el => setFieldRef('currentAddressLine', el)" v-model:value="form.currentAddressLine"
                            style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col v-if="!form.isCurrentAddressSameAsPermanent" :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Quốc gia (hiện tại)" name="currentCountry">
                          <a-input name="currentCountry" data-name="currentCountry"
                            :ref="el => setFieldRef('currentCountry', el)" v-model:value="form.currentCountry"
                            style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col v-if="!form.isCurrentAddressSameAsPermanent" :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Tỉnh/Thành (hiện tại)" name="currentProvince">
                          <a-input name="currentProvince" data-name="currentProvince"
                            :ref="el => setFieldRef('currentProvince', el)" v-model:value="form.currentProvince"
                            style="width:100%" />
                        </a-form-item>
                      </a-col>
                    </a-row>

                    <a-row v-if="!form.isCurrentAddressSameAsPermanent" :gutter="16" class="mt8">

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Quận/Huyện (hiện tại)" name="currentDistrict">
                          <a-input name="currentDistrict" data-name="currentDistrict"
                            :ref="el => setFieldRef('currentDistrict', el)" v-model:value="form.currentDistrict"
                            style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Phường/Xã (hiện tại)" name="currentWard">
                          <a-input name="currentWard" data-name="currentWard" :ref="el => setFieldRef('currentWard', el)"
                            v-model:value="form.currentWard" style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6"></a-col>
                    </a-row>
                  </div>
                </a-collapse-panel>

                <!-- Other -->
                <a-collapse-panel key="other" header="Thông tin khác">
                  <div class="panel-body">
                    <a-row :gutter="16">
                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Thu nhập hàng năm" name="annualIncome">
                          <a-input-number name="annualIncome" data-name="annualIncome"
                            :ref="el => setFieldRef('annualIncome', el)" v-model:value="form.annualIncome"
                            style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Đơn vị tiền tệ" name="incomeCurrency">
                          <a-input name="incomeCurrency" data-name="incomeCurrency"
                            :ref="el => setFieldRef('incomeCurrency', el)" v-model:value="form.incomeCurrency"
                            style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Tình trạng hôn nhân" name="maritalStatus">
                          <a-input name="maritalStatus" data-name="maritalStatus"
                            :ref="el => setFieldRef('maritalStatus', el)" v-model:value="form.maritalStatus"
                            style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Dân tộc" name="ethnicity">
                          <a-input name="ethnicity" data-name="ethnicity" :ref="el => setFieldRef('ethnicity', el)"
                            v-model:value="form.ethnicity" style="width:100%" />
                        </a-form-item>
                      </a-col>
                    </a-row>
                  </div>
                </a-collapse-panel>

                <!-- US Tax -->
                <a-collapse-panel key="ustax" header="Khai báo thuế Hoa Kỳ">
                  <div class="panel-body">
                    <a-row :gutter="16">

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item>
                          <a-checkbox name="orgHasUSControlPerson" data-name="orgHasUSControlPerson"
                            :ref="el => setFieldRef('orgHasUSControlPerson', el)"
                            v-model:checked="form.orgHasUSControlPerson">
                            Tổ chức có người kiểm soát là cư dân thuế Mỹ không
                          </a-checkbox>
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item>
                          <a-checkbox name="isUSTaxResident" data-name="isUSTaxResident"
                            :ref="el => setFieldRef('isUSTaxResident', el)" v-model:checked="form.isUSTaxResident">
                            Là cư dân thuế Hoa Kỳ
                          </a-checkbox>
                        </a-form-item>
                      </a-col>

                      <a-col v-if="form.isUSTaxResident" :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Mã số thuế (US Tax ID)" name="usTaxId">
                          <a-input name="usTaxId" data-name="usTaxId" :ref="el => setFieldRef('usTaxId', el)"
                            v-model:value="form.usTaxId" style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6"></a-col>
                      <a-col :xs="24" :sm="12" :md="12" :lg="6"></a-col>
                    </a-row>
                  </div>
                </a-collapse-panel>

                <!-- Security -->
                <a-collapse-panel key="security" header="Thông tin bảo mật">
                  <div class="panel-body">
                    <a-row :gutter="16">
                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item name="allowNotifySms">
                          <a-checkbox name="allowNotifySms" data-name="allowNotifySms"
                            :ref="el => setFieldRef('allowNotifySms', el)" v-model:checked="form.allowNotifySms">
                            Nhận SMS
                          </a-checkbox>
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item name="allowNotifyEmail">
                          <a-checkbox name="allowNotifyEmail" data-name="allowNotifyEmail"
                            :ref="el => setFieldRef('allowNotifyEmail', el)" v-model:checked="form.allowNotifyEmail">
                            Nhận Email
                          </a-checkbox>
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item name="allowNotifyPhone">
                          <a-checkbox name="allowNotifyPhone" data-name="allowNotifyPhone"
                            :ref="el => setFieldRef('allowNotifyPhone', el)" v-model:checked="form.allowNotifyPhone">
                            Nhận cuộc gọi
                          </a-checkbox>
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6"></a-col>
                    </a-row>
                  </div>
                </a-collapse-panel>
              </a-collapse>
            </template>

            <template v-else>
              <!-- Tổ chức -->
              <a-collapse v-model:activeKey="orgActiveKeys">
                <a-collapse-panel key="orgBasic" header="Thông tin tổ chức">
                  <div class="panel-body">
                    <a-row :gutter="16">
                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Tên tổ chức" name="organizationName">
                          <a-input name="organizationName" data-name="organizationName"
                            :ref="el => setFieldRef('organizationName', el)" v-model:value="form.organizationName"
                            style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Tên viết tắt (Trade name)" name="tradeName">
                          <a-input name="tradeName" data-name="tradeName" :ref="el => setFieldRef('tradeName', el)"
                            v-model:value="form.tradeName" style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Mã số thuế" name="taxNumber">
                          <a-input name="taxNumber" data-name="taxNumber" :ref="el => setFieldRef('taxNumber', el)"
                            v-model:value="form.taxNumber" style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Số ĐKKD" name="businessRegistrationNumber">
                          <a-input name="businessRegistrationNumber" data-name="businessRegistrationNumber"
                            :ref="el => setFieldRef('businessRegistrationNumber', el)"
                            v-model:value="form.businessRegistrationNumber" style="width:100%" />
                        </a-form-item>
                      </a-col>
                    </a-row>

                    <a-row :gutter="16" class="mt8">
                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Ngày cấp ĐKKD" name="businessRegistrationIssueDate">
                          <a-date-picker name="businessRegistrationIssueDate" data-name="businessRegistrationIssueDate"
                            :ref="el => setFieldRef('businessRegistrationIssueDate', el)"
                            v-model:value="form.businessRegistrationIssueDate" style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Nơi cấp ĐKKD" name="businessRegistrationIssuePlace">
                          <a-input name="businessRegistrationIssuePlace" data-name="businessRegistrationIssuePlace"
                            :ref="el => setFieldRef('businessRegistrationIssuePlace', el)"
                            v-model:value="form.businessRegistrationIssuePlace" style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="SĐT công ty" name="organizationPhone">
                          <a-input name="organizationPhone" data-name="organizationPhone"
                            :ref="el => setFieldRef('organizationPhone', el)" v-model:value="form.organizationPhone"
                            style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Email công ty" name="organizationEmail">
                          <a-input name="organizationEmail" data-name="organizationEmail"
                            :ref="el => setFieldRef('organizationEmail', el)" v-model:value="form.organizationEmail"
                            style="width:100%" />
                        </a-form-item>
                      </a-col>
                    </a-row>
                  </div>
                </a-collapse-panel>

                <a-collapse-panel key="rep" header="Người đại diện">
                  <div class="panel-body">
                    <a-row :gutter="16">
                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Họ và tên đại diện" name="representativeFullName">
                          <a-input name="representativeFullName" data-name="representativeFullName"
                            :ref="el => setFieldRef('representativeFullName', el)"
                            v-model:value="form.representativeFullName" style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Ngày sinh đại diện" name="representativeDob">
                          <a-date-picker name="representativeDob" data-name="representativeDob"
                            :ref="el => setFieldRef('representativeDob', el)" v-model:value="form.representativeDob"
                            style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Email đại diện" name="representativeEmail">
                          <a-input name="representativeEmail" data-name="representativeEmail"
                            :ref="el => setFieldRef('representativeEmail', el)" v-model:value="form.representativeEmail"
                            style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="SĐT đại diện" name="representativePhone">
                          <a-input name="representativePhone" data-name="representativePhone"
                            :ref="el => setFieldRef('representativePhone', el)" v-model:value="form.representativePhone"
                            style="width:100%" />
                        </a-form-item>
                      </a-col>
                    </a-row>
                  </div>
                </a-collapse-panel>

                <a-collapse-panel key="orgAddress" header="Địa chỉ trụ sở chính">
                  <div class="panel-body">
                    <a-row :gutter="16">
                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Địa chỉ" name="organizationHeadquarterAddressLine">
                          <a-input name="organizationHeadquarterAddressLine"
                            data-name="organizationHeadquarterAddressLine"
                            :ref="el => setFieldRef('organizationHeadquarterAddressLine', el)"
                            v-model:value="form.organizationHeadquarterAddressLine" style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Quốc gia" name="organizationHeadquarterCountry">
                          <a-input name="organizationHeadquarterCountry" data-name="organizationHeadquarterCountry"
                            :ref="el => setFieldRef('organizationHeadquarterCountry', el)"
                            v-model:value="form.organizationHeadquarterCountry" style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Tỉnh/Thành" name="organizationHeadquarterProvince">
                          <a-input name="organizationHeadquarterProvince" data-name="organizationHeadquarterProvince"
                            :ref="el => setFieldRef('organizationHeadquarterProvince', el)"
                            v-model:value="form.organizationHeadquarterProvince" style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Quận/Huyện" name="organizationHeadquarterDistrict">
                          <a-input name="organizationHeadquarterDistrict" data-name="organizationHeadquarterDistrict"
                            :ref="el => setFieldRef('organizationHeadquarterDistrict', el)"
                            v-model:value="form.organizationHeadquarterDistrict" style="width:100%" />
                        </a-form-item>
                      </a-col>
                    </a-row>
                  </div>
                </a-collapse-panel>

                <a-collapse-panel key="orgOther" header="Thông tin khác / Khai báo thuế">
                  <div class="panel-body">
                    <a-row :gutter="16">
                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="Ngành nghề" name="businessActivity">
                          <a-input name="businessActivity" data-name="businessActivity"
                            :ref="el => setFieldRef('businessActivity', el)" v-model:value="form.businessActivity"
                            style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item>
                          <a-checkbox name="orgHasUSControlPerson" data-name="orgHasUSControlPerson"
                            :ref="el => setFieldRef('orgHasUSControlPerson', el)"
                            v-model:checked="form.orgHasUSControlPerson">
                            Tổ chức có người kiểm soát là cư dân thuế Mỹ
                          </a-checkbox>
                        </a-form-item>
                      </a-col>

                      <a-col v-if="form.isUSTaxResident" :xs="24" :sm="12" :md="12" :lg="6">
                        <a-form-item label="US Tax ID" name="usTaxId">
                          <a-input name="usTaxId" data-name="usTaxId" :ref="el => setFieldRef('usTaxId', el)"
                            v-model:value="form.usTaxId" style="width:100%" />
                        </a-form-item>
                      </a-col>

                      <a-col :xs="24" :sm="12" :md="12" :lg="6"></a-col>
                    </a-row>
                  </div>
                </a-collapse-panel>
              </a-collapse>
            </template>
          </a-form>
        </a-spin>

        <div class="mt20">
          <a-button @click="prev">Quay lại</a-button>
          <a-button type="primary" class="ml10" @click="next">Tiếp tục</a-button>
           <a-button type="default" class="ml10" @click="onBack">
            <BackwardOutlined /> Trở lại danh sách
          </a-button>
        </div>
      </div>

      <!-- Step 3 -->
      <div v-if="currentStep === 2">
        <a-card title="Xác nhận thông tin">
          <pre>{{ form }}</pre>
        </a-card>
        <div class="mt20">
          <a-button @click="prev">Quay lại</a-button>
          <a-button type="primary" class="ml10" @click="onSubmit" :isLoadding="isLoadding">
            <CheckOutlined /> Tạo khách hàng
          </a-button>
          <a-button type="default" class="ml10" @click="onBack">
            <BackwardOutlined /> Trở lại danh sách
          </a-button>
        </div>
      </div>

    </div>
  </router-view>
</template>

<script setup lang="ts">
// import { useMessage } from '@/hooks/useMessage';
import type { Rule } from 'ant-design-vue/lib/form/interface';
import { ref, nextTick } from 'vue';
import { LeadApi, LeadCreateReq, LeadUpdateReq } from '@/apis';
import { message, type FormInstance } from 'ant-design-vue';
import { BackwardOutlined, CheckOutlined, DownOutlined, UpOutlined } from '@ant-design/icons-vue';
import dayjs, { Dayjs } from 'dayjs';
import { toIsoIfDateLike } from '@/utils/dateUtil';

// router
const router = useRouter();
const route = useRoute();

const isLoadding = ref<boolean>(false);

// get id params
const id = String(route.params.id ?? '');
const loading = ref(false);

// default form init — đảm bảo các boolean có giá trị
const defaultForm: LeadUpdateReq = {
  leadId: id,
  // Basic
  fullName: '',
  givenNames: undefined,
  familyName: undefined,
  gender: undefined,
  dob: undefined,
  otherNames: undefined,
  employerName: undefined,
  birthCountry: undefined,
  idType: undefined,
  idNumber: undefined,
  idIssueDate: undefined,
  idExpiryDate: undefined,
  idIssuePlace: undefined,
  nationality: undefined,
  secondaryNationality: undefined,
  maritalStatus: undefined,
  ethnicity: undefined,

  // Contact
  mobilePhone: undefined,
  otherPhone: undefined,
  email: undefined,
  allowNotifySms: false,
  allowNotifyEmail: false,
  allowNotifyPhone: false,

  // Addresses
  permanentAddressType: undefined,
  permanentAddressLine: undefined,
  permanentCountry: undefined,
  permanentProvince: undefined,
  permanentDistrict: undefined,
  permanentWard: undefined,

  currentAddressType: undefined,
  currentAddressLine: undefined,
  currentCountry: undefined,
  currentProvince: undefined,
  currentDistrict: undefined,
  currentWard: undefined,
  isCurrentAddressSameAsPermanent: true,

  // Other
  annualIncome: undefined,
  incomeCurrency: undefined,
  isUSTaxResident: false,
  usTaxId: undefined,

  // Organization
  orgHasUSControlPerson: false,
  isOrganization: false,
  organizationName: undefined,
  tradeName: undefined,
  businessRegistrationNumber: undefined,
  businessRegistrationIssueDate: undefined,
  businessRegistrationIssuePlace: undefined,
  taxNumber: undefined,
  taxNumberIssueDate: undefined,
  taxNumberIssuePlace: undefined,
  businessActivity: undefined,
  organizationPhone: undefined,
  organizationEmail: undefined,
  organizationFax: undefined,
  organizationHeadquarterAddressLine: undefined,
  organizationHeadquarterCountry: undefined,
  organizationHeadquarterProvince: undefined,
  organizationHeadquarterDistrict: undefined,
  organizationHeadquarterWard: undefined,
  organizationForeignAddress: undefined,

  // Representative
  representativeFullName: undefined,
  representativeGivenNames: undefined,
  representativeFamilyName: undefined,
  representativeDob: undefined,
  representativeGender: undefined,
  representativeIdType: undefined,
  representativeIdNumber: undefined,
  representativeIdIssueDate: undefined,
  representativeIdExpiryDate: undefined,
  representativeIdIssuePlace: undefined,
  representativeNationality: undefined,
  representativeSecondaryNationality: undefined,
  representativeEmail: undefined,
  representativePhone: undefined
}

// step + formRef
const currentStep = ref(0);
const formRef = ref<FormInstance>();
const form = ref<LeadUpdateReq>({...defaultForm});
const isStep3Enabled = ref(false);

// Khai báo array chứa tất cả key cho phần Cá nhân và Tổ chức:
const allPersonalPanels = ['basic', 'contact', 'addresses', 'other', 'ustax', 'security']; //
const allOrgPanels = ['orgBasic', 'rep', 'orgAddress', 'orgOther'];


// collapse state keys (array of active keys)
const personalActiveKeys = ref<string[]>([...allPersonalPanels]); // mở tất cả cá nhân
const orgActiveKeys = ref<string[]>([...allOrgPanels]); // mở tất cả tổ chức
// collapse state (mặc định mở tất cả)
const activeKeys = ref<string[]>([...allPersonalPanels, ...allOrgPanels]);

// helper to render panel header with toggle icon (optional)
const panelHeader = (title: string, key: string) => {
  // header can be string or VNode; here return string and icon handled by collapse arrow
  return title;
};


/**
 * Sao chép an toàn từ source -> target (không thay reference target)
 * - Giữ nguyên reference của `target` (quan trọng với reactive form)
 * - Hỗ trợ primitives, Date, Array, plain Object
 * - Với các giá trị phức tạp không xử lý, gán trực tiếp (tham chiếu)
 */
function shallowSafeAssign(target: Record<string, any>, source: Record<string, any>) {
  for (const key of Object.keys(source)) {
    const val = source[key];

    if (val === null || val === undefined) {
      target[key] = val;
      continue;
    }

    // Date
    if (val instanceof Date) {
      target[key] = new Date(val);
      continue;
    }

    // Array (shallow clone)
    if (Array.isArray(val)) {
      target[key] = val.map(item => {
        if (item instanceof Date) return new Date(item);
        if (item && typeof item === 'object') return JSON.parse(JSON.stringify(item));
        return item;
      });
      continue;
    }

    // Plain object -> shallow deep clone via JSON (good enough for form data)
    if (typeof val === 'object') {
      try {
        target[key] = JSON.parse(JSON.stringify(val));
      } catch {
        // nếu không stringify được (circular,...), gán trực tiếp tham chiếu
        target[key] = val;
      }
      continue;
    }

    // primitives (string/number/boolean)
    target[key] = val;
  }

  // nếu target có khóa mà source không có: unset hoặc set undefined (tùy nhu cầu)
  for (const k of Object.keys(target)) {
    if (!(k in source)) {
      // giữ nguyên hoặc xóa; ở đây gán undefined để đảm bảo reset
      (target as any)[k] = undefined;
    }
  }
}

async function resetToDefault(defaultForm: Record<string, any>) {
  // 1) ghi đè các thuộc tính trên object reactive hiện có
  shallowSafeAssign(form.value as any, defaultForm);

  // 2) chờ Vue cập nhật DOM/reactive
  await nextTick();

  // 3) reset Ant Form internal state và clear validation
  formRef.value?.resetFields();
  formRef.value?.clearValidate?.();

  // 4) reset collapse & step về mặc định
  personalActiveKeys.value = [...allPersonalPanels]; // hoặc [] nếu muốn đóng hết
  orgActiveKeys.value = [...allOrgPanels];
  currentStep.value = 0;
}

// --- Rules grouped by domain ---
const rulesBasic: Record<string, Rule | Rule[]> = {
  fullName: [{ required: true, message: 'Vui lòng nhập họ và tên', trigger: 'blur' }],
  gender: [{ required: true, message: 'Vui lòng chọn giới tính', trigger: 'change' }],
  // dob: [{ required: true, message: 'Vui lòng chọn ngày sinh', trigger: 'change' }],
  dob: [{ type: 'object', required: true, message: 'Vui lòng chọn ngày sinh', trigger: 'change' }],
  idNumber: [
    { required: true, message: 'Vui lòng nhập số CMND/CCCD', trigger: 'blur' },
    { pattern: /^[0-9]{9,12}$/, message: 'Số CMND/CCCD không hợp lệ', trigger: 'blur' }
  ]
};

const rulesContact: Record<string, Rule | Rule[]> = {
  email: [{ type: 'email', message: 'Email không hợp lệ', trigger: 'blur' }],
  mobilePhone: [
    { required: true, message: 'Vui lòng nhập số điện thoại', trigger: 'blur' },
    { pattern: /^[0-9]{9,11}$/, message: 'Số điện thoại phải từ 9-11 chữ số', trigger: 'blur' }
  ]
};

const rulesAddresses: Record<string, Rule | Rule[]> = {
  permanentAddressType: [{ required: true, message: 'Vui lòng nhập Loại địa chỉ thường trú', trigger: 'change' }],
  permanentAddressLine: [{ required: true, message: 'Vui lòng nhập địa chỉ trường trú', trigger: 'blur' }],
  permanentCountry: [{ required: true, message: 'Vui lòng nhập quốc gia', trigger: 'blur' }],
  permanentProvince: [{ required: true, message: 'Vui lòng nhập tỉnh/thành', trigger: 'blur' }]
  // bạn có thể thêm permanentDistrict, permanentWard nếu muốn required
};

const rulesOther: Record<string, Rule | Rule[]> = {
  annualIncome: [{ type: 'number', min: 0, message: 'Thu nhập phải là số dương', trigger: 'blur' }],
  incomeCurrency: [{ required: false, message: 'Vui lòng nhập đơn vị tiền tệ', trigger: 'blur' }]
};

const rulesUSTax: Record<string, Rule | Rule[]> = {
  usTaxId: [{ required: true, message: 'Vui lòng nhập mã số thuế Hoa Kỳ', trigger: 'blur' }]
};

const rulesSecurity: Record<string, Rule | Rule[]> = {
  allowNotifySms: [{ type: 'boolean' }],
  allowNotifyEmail: [{ type: 'boolean' }],
  allowNotifyPhone: [{ type: 'boolean' }]
};

const rulesOrganization: Record<string, Rule | Rule[]> = {
  organizationName: [{ required: true, message: 'Vui lòng nhập tên tổ chức', trigger: 'blur' }],
  taxNumber: [
    { required: false, message: 'Vui lòng nhập mã số thuế tổ chức', trigger: 'blur' },
    { pattern: /^[0-9]{10,13}$/, message: 'Mã số thuế phải từ 10-13 chữ số', trigger: 'blur' }
  ],
  businessActivity: [{ required: false, message: 'Vui lòng nhập ngành nghề', trigger: 'blur' }]
};

const rulesRepresentative: Record<string, Rule | Rule[]> = {
  representativeFullName: [{ required: true, message: 'Vui lòng nhập tên người đại diện', trigger: 'blur' }],
  representativeEmail: [{ type: 'email', message: 'Email người đại diện không hợp lệ', trigger: 'blur' }],
  representativePhone: [{ pattern: /^[0-9]{9,11}$/, message: 'Số điện thoại người đại diện không hợp lệ', trigger: 'blur' }]
};

// Combine into single rules object for <a-form>
const rulesCombined: Record<string, Rule | Rule[]> = {
  ...rulesBasic,
  ...rulesContact,
  ...rulesAddresses,
  ...rulesOther,
  ...rulesUSTax,
  ...rulesSecurity,
  ...rulesOrganization,
  ...rulesRepresentative
};

// --- Helper: lists of field names per flow (used for partial validation) ---
// field lists for partial validation
const personalFieldsStep2Base = [
  'fullName', 'givenNames', 'familyName', 'gender', 'dob', 'idNumber',
  'mobilePhone', 'otherPhone', 'email',
  'permanentAddressLine', 'permanentCountry', 'permanentProvince', 'permanentDistrict', 'permanentWard',
  'annualIncome', 'incomeCurrency', 'usTaxId',
  'allowNotifySms', 'allowNotifyEmail', 'allowNotifyPhone', 'permanentAddressType'
];

const organizationFieldsStep2Base = [
  'organizationName', 'tradeName', 'taxNumber', 'businessRegistrationNumber', 'businessRegistrationIssueDate',
  'organizationPhone', 'organizationEmail',
  'organizationHeadquarterAddressLine', 'organizationHeadquarterCountry', 'organizationHeadquarterProvince',
  'businessActivity', 'representativeFullName', 'representativeEmail', 'representativePhone', 'usTaxId'
];

// Map field name -> panel key
const fieldToPanelMap: Record<string, string> = {
  // personal
  fullName: 'basic',
  givenNames: 'basic',
  familyName: 'basic',
  gender: 'basic',
  dob: 'basic',
  idType: 'basic',
  idNumber: 'basic',

  mobilePhone: 'contact',
  otherPhone: 'contact',
  email: 'contact',
  nationality: 'contact',

  permanentAddressType: 'addresses',
  permanentAddressLine: 'addresses',
  permanentCountry: 'addresses',
  permanentProvince: 'addresses',
  permanentDistrict: 'addresses',
  permanentWard: 'addresses',
  currentAddressLine: 'addresses',
  currentCountry: 'addresses',
  currentProvince: 'addresses',
  currentDistrict: 'addresses',
  currentWard: 'addresses',

  annualIncome: 'other',
  incomeCurrency: 'other',
  maritalStatus: 'other',
  ethnicity: 'other',

  isUSTaxResident: 'ustax',
  usTaxId: 'ustax',

  allowNotifySms: 'security',
  allowNotifyEmail: 'security',
  allowNotifyPhone: 'security',

  // organization
  organizationName: 'orgBasic',
  tradeName: 'orgBasic',
  taxNumber: 'orgBasic',
  businessRegistrationNumber: 'orgBasic',
  businessRegistrationIssueDate: 'orgBasic',
  businessRegistrationIssuePlace: 'orgBasic',
  organizationPhone: 'orgBasic',
  organizationEmail: 'orgBasic',

  representativeFullName: 'rep',
  representativeDob: 'rep',
  representativeEmail: 'rep',
  representativePhone: 'rep',

  organizationHeadquarterAddressLine: 'orgAddress',
  organizationHeadquarterCountry: 'orgAddress',
  organizationHeadquarterProvince: 'orgAddress',
  organizationHeadquarterDistrict: 'orgAddress',
  organizationHeadquarterWard: 'orgAddress',
  organizationForeignAddress: 'orgAddress',

  businessActivity: 'orgOther',
  orgHasUSControlPerson: 'orgOther'
};

// refs cho từng field (normalised DOM)/
// Map field name -> element ref
const fieldRefs: Record<string, HTMLElement | null> = {};
const setFieldRef = (name: string, el: any) => {
  if (!el) {
    fieldRefs[name] = null;
    return;
  }

  // If it's a Vue component instance, try to get its root DOM element
  // Vue 3 component ref may be a DOM element directly or a component proxy
  let dom: HTMLElement | null = null;
  if (el instanceof HTMLElement) {
    dom = el;
  } else if (el?.$el instanceof HTMLElement) {
    dom = el.$el;
  } else if (el?.$?.el instanceof HTMLElement) {
    dom = el.$.el as HTMLElement;
  } 
  else if (typeof el === 'object' && (el as HTMLElement).querySelector) 
    dom = el as unknown as HTMLElement;
  else {
    // try to find input inside the node (for wrappers)
    const maybe = (el as HTMLElement);
    if (maybe && typeof maybe.querySelector === 'function') dom = maybe;
  }

  fieldRefs[name] = dom;
};

const setFieldRef2 = (name: string, el: any) => {
  if (!el) { fieldRefs[name] = null; return; }
  // normalize component proxy -> HTMLElement
  let dom: HTMLElement | null = null;
  if (el instanceof HTMLElement) dom = el;
  else if (el?.$el instanceof HTMLElement) dom = el.$el;
  else if (el?.$?.el instanceof HTMLElement) dom = el.$.el as HTMLElement;
  else if (typeof el === 'object' && (el as HTMLElement).querySelector) dom = el as unknown as HTMLElement;
  fieldRefs[name] = dom;
};

// open panel for a field
const openPanelForField = async (fieldName: string) => {
  const panel = fieldToPanelMap[fieldName];
  if (!panel) return;
  if (!form.value.isOrganization) {
    // personalActiveKeys.value = [panel]; // -> chỉ mở 1 panel đang active
    // đảm bảo panel hiển thị: activeKeys chứa panel (nếu muốn mở tất cả, activeKeys luôn chứa)
    if (!personalActiveKeys.value.includes(panel)) personalActiveKeys.value.push(panel);
  } else {
    // orgActiveKeys.value = [panel];
    if (!orgActiveKeys.value.includes(panel)) orgActiveKeys.value.push(panel);
  }
  // wait for collapse content to render
  await nextTick();
  await nextTick();
};

// improved focus + scroll helper (safe)
const focusAndScrollTo = (el: HTMLElement | null) => {
  if (!el) return;
  try {
    // Prefer focusing inner input if present (date-picker, select wrappers)
    const innerInput = el.querySelector<HTMLInputElement>('input, textarea, select');
    const target = innerInput ?? el;

    // focus if possible
    (target as HTMLElement).focus?.();

    // move cursor to end for input
    if (innerInput && 'setSelectionRange' in innerInput) {
      const val = innerInput.value ?? '';
      try { innerInput.setSelectionRange(val.length, val.length); } catch { }
    }

    // scrollIntoView if available, otherwise fallback to window.scrollTo
    if (typeof (target as any).scrollIntoView === 'function') {
      (target as any).scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      // compute bounding rect and scroll
      const rect = (target as HTMLElement).getBoundingClientRect();
      const offset = rect.top + window.pageYOffset - (window.innerHeight / 2);
      window.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' });
    }
  } catch (e) {
    // silent
  }
};

// find first field with AntD error and open its panel then focus
const focusFirstInvalid = async () => {
  await nextTick();
  // AntD adds class .ant-form-item-has-error to form-item wrapper
  const firstErrorFormItem = document.querySelector<HTMLElement>('.ant-form-item-has-error');
  if (!firstErrorFormItem) return;

  // try to get field name via data-name or name attributes inside the form item
  let fieldName: string | undefined;
  const namedEl = firstErrorFormItem.querySelector<HTMLElement>('[data-name], [name]');
  if (namedEl) {
    fieldName = namedEl.getAttribute('data-name') || namedEl.getAttribute('name') || undefined;
  }

  // fallback: try match known field names by checking presence inside formItem
  if (!fieldName) {
    for (const k of Object.keys(fieldToPanelMap)) {
      if (firstErrorFormItem.querySelector(`[data-name="${k}"], [name="${k}"]`)) {
        fieldName = k;
        break;
      }
    }
  }

  if (fieldName) {
    await openPanelForField(fieldName);
    await nextTick();
    // re-query element from our stored refs first
    const refEl = fieldRefs[fieldName] ?? document.querySelector<HTMLElement>(`.ant-form-item-has-error [data-name="${fieldName}"], [name="${fieldName}"]`);
    if (refEl) {
      focusAndScrollTo(refEl);
      return;
    }
  }

  // fallback: focus first focusable inside firstErrorFormItem
  const focusable = firstErrorFormItem.querySelector<HTMLElement>('input, textarea, .ant-picker-input input, .ant-select-selection--single, [tabindex]');
  if (focusable) focusAndScrollTo(focusable);
};


const onBack = () => {
  router.push('/lead');
}

// navigation & validation
const next = async () => {
  if (currentStep.value === 0) {
    currentStep.value++;
    return;
  }

  if (currentStep.value === 1) {
    try {
      if (!form.value.isOrganization) {
        // personal: build fields to validate
        let fields = [...personalFieldsStep2Base];
        if (form.value.isCurrentAddressSameAsPermanent) {
          // remove current address fields if present
          const currentAddr = ['currentAddressLine', 'currentCountry', 'currentProvince', 'currentDistrict', 'currentWard'];
          const setToRemove = new Set(currentAddr);
          fields = fields.filter(f => !setToRemove.has(f));
        } else {
          // ensure current address fields included
          for (const f of ['currentAddressLine', 'currentCountry', 'currentProvince', 'currentDistrict', 'currentWard']) {
            if (!fields.includes(f)) fields.push(f);
          }
        }
        if (!form.value.isUSTaxResident) fields = fields.filter(f => f !== 'usTaxId');
        await formRef.value?.validate(fields);
      } else {
        // organization
        let fields = [...organizationFieldsStep2Base];
        if (!form.value.isUSTaxResident) fields = fields.filter(f => f !== 'usTaxId');
        await formRef.value?.validate(fields);
      }
      currentStep.value++;
      isStep3Enabled.value = true;
    } catch (err) {
      // validation failed
      console.warn('Validation failed', err);
      // sẽ hiển thị lỗi trên form; không chuyển bước
      isStep3Enabled.value = false;
      await focusFirstInvalid();
    }
  }
};

const prev = () => {
  if (currentStep.value > 0) currentStep.value--;
};

const onFinish = async () => {
  isLoadding.value = true;
  try {
    isLoadding.value = true;
    const payload = { ...form.value };

    // Khi gửi lên backend, chuyển dayjs về chuỗi ISO:

    if (payload.idIssueDate) payload.idIssueDate = toIsoIfDateLike(payload.idIssueDate);
    if (payload.dob) payload.dob = toIsoIfDateLike(payload.dob);
    if (payload.idExpiryDate) payload.idExpiryDate = toIsoIfDateLike(payload.idExpiryDate);
    if (payload.businessRegistrationIssueDate) payload.businessRegistrationIssueDate = toIsoIfDateLike(payload.businessRegistrationIssueDate);
    if (payload.taxNumberIssueDate) payload.taxNumberIssueDate = toIsoIfDateLike(payload.taxNumberIssueDate);
    if (payload.representativeDob) payload.representativeDob = toIsoIfDateLike(payload.representativeDob);
    if (payload.representativeIdIssueDate) payload.representativeIdIssueDate = toIsoIfDateLike(payload.representativeIdIssueDate);
    if (payload.representativeIdExpiryDate) payload.representativeIdExpiryDate = toIsoIfDateLike(payload.representativeIdExpiryDate);

    console.log('submit', payload)
    // TODO: call API update lead
    var res = await LeadApi.update(id, payload);
    if (res) {

      // thông báo thành công và chuyển hướng nếu cần
      message.success('Cập nhật thông tin khách hàng thành công.');
      // router.push('/lead');
      
    }
  }
  catch (error) {
    console.log('onFinish', error)
  }
  finally {
    isLoadding.value = false;
    isStep3Enabled.value = false;
  }
}

const onSubmit = async () => {
  try {
    await formRef.value?.validate();
    if (form.value.isOrganization === true && form.value.organizationName) {
      form.value.fullName = form.value.organizationName;
    }
    console.log('Submit lead payload', form.value);
    onFinish();
  } catch (err) {
    console.warn('Submit validation failed', err);
  }
  finally {
    await focusFirstInvalid();
  }
};

// Chặn click step trực tiếp: nếu người click vào step > current nhưng chưa hợp lệ thì ngăn
const handleStepChange = (target) => {
  if (target > currentStep.value) {
    if (target === 2 && !isStep3Enabled.value) {
      // chặn nhảy tới step 3 nếu chưa enable
      return;
    }
  }
  currentStep.value = target;
};

// load lead
const loadLead = async () => {
  loading.value = true;
  try {
    const resp = await LeadApi.getDetail(id);
    // map backend -> form model. Convert ISO date string -> Date object for date pickers -> 
    // khi map dữ liệu từ API 
    const mapped: any = { ...defaultForm, ...resp };
    if (mapped.dob) mapped.dob = dayjs(mapped.dob);
    if (mapped.idIssueDate) mapped.idIssueDate = dayjs(mapped.idIssueDate);
    if (mapped.idExpiryDate) mapped.idExpiryDate = dayjs(mapped.idExpiryDate);
    if (mapped.businessRegistrationIssueDate) mapped.businessRegistrationIssueDate = dayjs(mapped.businessRegistrationIssueDate);
    if (mapped.taxNumberIssueDate) mapped.taxNumberIssueDate = dayjs(mapped.taxNumberIssueDate);
    if (mapped.representativeDob) mapped.representativeDob = dayjs(mapped.representativeDob);
    if (mapped.representativeIdIssueDate) mapped.representativeIdIssueDate = dayjs(mapped.representativeIdIssueDate);
    if (mapped.representativeIdExpiryDate) mapped.representativeIdExpiryDate = dayjs(mapped.representativeIdExpiryDate);

    // set reactive model
    Object.keys(defaultForm).forEach(k => form.value[k] = mapped[k]);

    // chờ vue render
    await nextTick();
    // xóa trạng thái validate cũ / đồng bộ internal state
    formRef.value?.resetFields?.();
    formRef.value?.clearValidate?.();
    formRef.value?.validate(mapped);

  } catch (e) {
    message.error('Tải dữ liệu lỗi');
  } finally { loading.value = false; }
};

onMounted(async () => {
  if (id) { 
    await loadLead();
    await nextTick();
    await next();
  }
});

</script>
<style lang="less" scoped>
.node-container {
  .nc_title {
    margin-top: 6px;
    margin-bottom: 30px;
  }

  .mb20 {
    margin-bottom: 20px;
  }

  .mt20 {
    margin-top: 20px;
  }

  .ml10 {
    margin-left: 10px;
  }

  .panel-body {
    padding: 12px 0;
  }

  .mt8 {
    margin-top: 8px;
  }
}
</style>
