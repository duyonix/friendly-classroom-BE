#include <iostream>
#include "stdio.h"
#include <queue>
#include <string>
#include <cmath>
using namespace std;

int appendNumber(string a, string& b){
    if(b.size()>a.size()) return 0;
    bool greaterThan=0;
    bool lessThan=0;
    bool equalTo=1;
    int n=b.size();
    for(int i=0;i<n;i++){
        if(b[i]>a[i] && equalTo){
            equalTo=false;
            greaterThan=true;
        }
        else if(b[i]<a[i] && equalTo){
            equalTo=false;
            lessThan=true;
        }
    }
    if(greaterThan){
        if(b.size()==a.size()) return 0;
        else{
            int res=a.size()-b.size();
            for(int j=0;j<res;j++){
                b=b+"0";
            }
            return res;
        }
    }
    else if(lessThan){
        int res=a.size()-b.size()+1;
        for(int j=0;j<res;j++){
            b=b+"0";
        }
        return res;
    }
    else{
        // equal
        if(a.size()==b.size()){
            b=b+"0";
            return 1;
        }
        else{
            string temp=a.substr(b.size());
//            cout<<"temp: "<<temp<<"\n";
            int t=stoi(temp);
//            cout<<"t1: "<<t<<"\n";
            t=t+1;
//            cout<<"t2: "<<t<<"\n";
            temp=to_string(t);
            if(temp.size()>a.size()-b.size()){
                temp[0]='0';
            }
            else if(temp.size()<a.size()-b.size()){
                while(temp.size()<a.size()-b.size()){
                    temp='0'+temp;
                }
            }
            b=b+temp;
            return temp.size();
        }
    }

}

int main()
{
    int t;
    cin>>t;
    for(int tc=1;tc<=t;tc++){
        int n;
        cin>>n;
        int ans=0;
        string temp;
        for(int i=0;i<n;i++){
            string cur;
            cin>>cur;
            if(i!=0){
                ans=ans+appendNumber(temp, cur);
            }
            temp=cur;
        }
        cout<<"Case #"<<tc<<": "<<ans<<"\n";
    }
    return 0;
}
