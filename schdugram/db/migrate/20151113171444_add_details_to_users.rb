class AddDetailsToUsers < ActiveRecord::Migration
  def change
    add_column :users, :first_name, :string
    add_column :users, :last_name, :string
    add_column :users, :company, :string
    add_column :users, :country, :string
    add_column :users, :city, :string
    add_column :users, :referral_code, :string
    add_column :users, :currency_pay, :string
    add_column :users, :token, :string
  end
end
